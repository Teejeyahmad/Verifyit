import { useEffect, useState } from "react";
import {
  ShieldCheck,
  Plus,
  CheckCircle,
  AlertTriangle,
  Clock,
  FileText,
  Star,
  TrendingUp,
  BarChart2,
  Lock,
  Save,
  X,
  Upload,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import {
  Layout,
  PageHeader,
  EmptyState,
  Loader,
  Modal,
  FormGroup,
} from "../components/UI";

// ─── Escrow ───────────────────────────────────────────────────────────────────
export function Escrow() {
  const [escrows, setEscrows] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    productId: "",
    recipientBusinessId: "",
    amount: "",
  });
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    Promise.all([api.get("/escrow"), api.get("/products")])
      .then(([e, p]) => {
        setEscrows(e.data.escrows);
        setProducts(p.data.products);
      })
      .catch(() => toast.error("Failed to load escrow data"))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.productId || !form.recipientBusinessId || !form.amount)
      return toast.error("All fields are required");
    setSubmitting(true);
    try {
      const res = await api.post("/escrow", {
        ...form,
        amount: Number(form.amount),
      });
      setEscrows((p) => [res.data.escrow, ...p]);
      setShowModal(false);
      setForm({ productId: "", recipientBusinessId: "", amount: "" });
      toast.success("Escrow created. Funds held securely.");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRelease = async (id) => {
    if (!confirm("Release funds to recipient?")) return;
    try {
      const res = await api.put(`/escrow/${id}/release`);
      setEscrows((p) => p.map((e) => (e._id === id ? res.data.escrow : e)));
      toast.success("Escrow released");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed");
    }
  };

  const handleDispute = async (id) => {
    const reason = prompt("Reason for dispute:");
    if (!reason) return;
    try {
      const res = await api.put(`/escrow/${id}/dispute`, { reason });
      setEscrows((p) => p.map((e) => (e._id === id ? res.data.escrow : e)));
      toast.success("Dispute raised");
    } catch {
      toast.error("Failed to raise dispute");
    }
  };

  const statusClass = {
    held: "tag-amber",
    released: "tag-green",
    disputed: "tag-red",
    pending: "tag-gray",
    refunded: "tag-blue",
  };
  const statusIcon = {
    held: Clock,
    released: CheckCircle,
    disputed: AlertTriangle,
  };

  return (
    <Layout>
      <PageHeader
        title="Escrow"
        subtitle="Hold payments securely until delivery is verified"
        action={
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary text-xs sm:text-sm px-3 sm:px-5"
          >
            <Plus size={15} />{" "}
            <span className="hidden sm:inline">New Escrow</span>
            <span className="sm:hidden">New</span>
          </button>
        }
      />

      {loading ? (
        <Loader />
      ) : escrows.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No escrow payments"
          subtitle="Create an escrow to hold funds securely until QR verification confirms delivery"
          action={
            <button onClick={() => setShowModal(true)} className="btn-primary">
              <Plus size={16} /> Create Escrow
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {escrows.map((e) => {
            const Icon = statusIcon[e.status] || Clock;
            const bg =
              e.status === "held"
                ? "bg-amber-50"
                : e.status === "released"
                  ? "bg-primary-50"
                  : "bg-red-50";
            const ic =
              e.status === "held"
                ? "text-amber-600"
                : e.status === "released"
                  ? "text-primary-600"
                  : "text-red-500";
            return (
              <div key={e._id} className="card p-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bg}`}
                  >
                    <Icon size={17} className={ic} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {e.product?.name || "Product"}
                      </p>
                      <p className="font-display font-700 text-gray-900 shrink-0">
                        ₦{e.amount?.toLocaleString()}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      {e.payer?.name} → {e.recipient?.name}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={statusClass[e.status] || "tag-gray"}>
                        {e.status}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(e.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {e.status === "held" && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleRelease(e._id)}
                          className="btn-primary text-xs px-3 py-1.5 flex-1 sm:flex-none"
                        >
                          Release
                        </button>
                        <button
                          onClick={() => handleDispute(e._id)}
                          className="btn-secondary text-xs px-3 py-1.5 flex-1 sm:flex-none"
                        >
                          Dispute
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Create Escrow"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <FormGroup label="Product">
            <select
              className="input"
              value={form.productId}
              onChange={(e) => set("productId", e.target.value)}
            >
              <option value="">Select a product</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </FormGroup>
          <FormGroup label="Recipient Business ID">
            <input
              className="input"
              placeholder="MongoDB _id of the recipient"
              value={form.recipientBusinessId}
              onChange={(e) => set("recipientBusinessId", e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">
              Recipient can find their ID on their Profile page
            </p>
          </FormGroup>
          <FormGroup label="Amount (₦)">
            <input
              className="input"
              type="number"
              min="1"
              placeholder="250000"
              value={form.amount}
              onChange={(e) => set("amount", e.target.value)}
            />
          </FormGroup>
          <div className="bg-primary-50 border border-primary-100 rounded-xl p-3 text-xs text-primary-700">
            Funds held until you release after verifying the QR code on
            delivery.
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full spin" />
            ) : (
              "Create Escrow"
            )}
          </button>
        </form>
      </Modal>
    </Layout>
  );
}

// ─── Invoices ─────────────────────────────────────────────────────────────────
export function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({
    recipientName: "",
    recipientEmail: "",
    invoiceAmount: "",
    dueDate: "",
  });
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    api
      .get("/invoices")
      .then((r) => setInvoices(r.data.invoices))
      .catch(() => toast.error("Failed to load invoices"))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !form.recipientName ||
      !form.recipientEmail ||
      !form.invoiceAmount ||
      !form.dueDate
    )
      return toast.error("All fields are required");
    setSubmitting(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (file) fd.append("invoiceFile", file);
    try {
      const res = await api.post("/invoices", fd);
      setInvoices((p) => [res.data.invoice, ...p]);
      setShowModal(false);
      setForm({
        recipientName: "",
        recipientEmail: "",
        invoiceAmount: "",
        dueDate: "",
      });
      setFile(null);
      toast.success(
        `Invoice submitted! ₦${res.data.advanceAmount?.toLocaleString()} will be advanced.`,
      );
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  const statusClass = {
    pending: "tag-amber",
    approved: "tag-blue",
    disbursed: "tag-green",
    repaid: "tag-gray",
    rejected: "tag-red",
  };

  return (
    <Layout>
      <PageHeader
        title="Invoices"
        subtitle="Get 80% of invoice value upfront via First Bank"
        action={
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary text-xs sm:text-sm px-3 sm:px-5"
          >
            <Plus size={15} />{" "}
            <span className="hidden sm:inline">Submit Invoice</span>
            <span className="sm:hidden">Submit</span>
          </button>
        }
      />

      {loading ? (
        <Loader />
      ) : invoices.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No invoices yet"
          subtitle="Submit an invoice to receive 80% of its value immediately through First Bank"
          action={
            <button onClick={() => setShowModal(true)} className="btn-primary">
              <Plus size={16} /> Submit Invoice
            </button>
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="card p-0 overflow-hidden hidden md:block">
            <div className="grid grid-cols-12 gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <div className="col-span-3">Recipient</div>
              <div className="col-span-2">Invoice</div>
              <div className="col-span-2">Advance (80%)</div>
              <div className="col-span-2">Due Date</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1" />
            </div>
            {invoices.map((inv, i) => (
              <div
                key={inv._id}
                className={`grid grid-cols-12 gap-3 px-5 py-4 items-center text-sm ${i < invoices.length - 1 ? "border-b border-gray-100" : ""}`}
              >
                <div className="col-span-3">
                  <p className="font-semibold text-gray-900 truncate">
                    {inv.recipientName}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {inv.recipientEmail}
                  </p>
                </div>
                <div className="col-span-2 font-semibold text-gray-700">
                  ₦{inv.invoiceAmount?.toLocaleString()}
                </div>
                <div className="col-span-2 font-semibold text-primary-700">
                  ₦{inv.advanceAmount?.toLocaleString()}
                </div>
                <div className="col-span-2 text-gray-500 text-xs">
                  {new Date(inv.dueDate).toLocaleDateString("en-GB")}
                </div>
                <div className="col-span-2">
                  <span className={statusClass[inv.status] || "tag-gray"}>
                    {inv.status}
                  </span>
                </div>
                <div className="col-span-1 text-center">
                  {inv.invoiceFile && (
                    <a
                      href={inv.invoiceFile}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-primary-600 hover:underline font-semibold"
                    >
                      View
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {invoices.map((inv) => (
              <div key={inv._id} className="card p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {inv.recipientName}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {inv.recipientEmail}
                    </p>
                  </div>
                  <span className={statusClass[inv.status] || "tag-gray"}>
                    {inv.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-400">Invoice</p>
                    <p className="font-semibold text-gray-700">
                      ₦{inv.invoiceAmount?.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">You receive (80%)</p>
                    <p className="font-semibold text-primary-700">
                      ₦{inv.advanceAmount?.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Due Date</p>
                    <p className="font-semibold text-gray-700">
                      {new Date(inv.dueDate).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                  {inv.invoiceFile && (
                    <div className="flex items-end">
                      <a
                        href={inv.invoiceFile}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary-600 font-semibold hover:underline"
                      >
                        View File
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Submit Invoice for Discounting"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-primary-50 border border-primary-100 rounded-xl p-3 text-xs text-primary-700">
            You receive <strong>80%</strong> upfront. First Bank collects the
            full amount from your recipient on due date.
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormGroup label="Recipient Name">
              <input
                className="input"
                placeholder="Hospital or Store name"
                value={form.recipientName}
                onChange={(e) => set("recipientName", e.target.value)}
              />
            </FormGroup>
            <FormGroup label="Recipient Email">
              <input
                className="input"
                type="email"
                placeholder="recipient@org.com"
                value={form.recipientEmail}
                onChange={(e) => set("recipientEmail", e.target.value)}
              />
            </FormGroup>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormGroup label="Invoice Amount (₦)">
              <input
                className="input"
                type="number"
                min="1"
                placeholder="500000"
                value={form.invoiceAmount}
                onChange={(e) => set("invoiceAmount", e.target.value)}
              />
            </FormGroup>
            <FormGroup label="Due Date">
              <input
                className="input"
                type="date"
                value={form.dueDate}
                onChange={(e) => set("dueDate", e.target.value)}
              />
            </FormGroup>
          </div>
          <FormGroup label="Invoice File (optional)">
            <input
              className="input"
              type="file"
              accept=".pdf,image/*"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </FormGroup>
          {Number(form.invoiceAmount) > 0 && (
            <div className="bg-gold-100 border border-gold-300 rounded-xl p-3 text-sm text-gold-700">
              You will receive:{" "}
              <strong className="font-display">
                ₦{(Number(form.invoiceAmount) * 0.8).toLocaleString()}
              </strong>{" "}
              upfront
            </div>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full spin" />
            ) : (
              "Submit Invoice"
            )}
          </button>
        </form>
      </Modal>
    </Layout>
  );
}

// ─── Trust Score ──────────────────────────────────────────────────────────────
export function TrustScore() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/trust-score")
      .then((r) => setData(r.data))
      .catch(() => toast.error("Failed to load Trust Score"))
      .finally(() => setLoading(false));
  }, []);

  const tierColor = {
    Gold: "text-gold-500",
    Silver: "text-gray-400",
    Bronze: "text-amber-700",
    None: "text-gray-400",
  };
  const tips = [
    { tip: "Add CAC registration number in Profile", points: "+20 pts" },
    { tip: "Add NAFDAC registration number", points: "+15 pts" },
    { tip: "Register more products", points: "+2 pts each" },
    { tip: "Generate more QR scans through sales", points: "+1 per 10 scans" },
    { tip: "Complete successful transactions", points: "+1 per transaction" },
  ];

  return (
    <Layout>
      <PageHeader
        title="Trust Score"
        subtitle="Your verified financial identity on the VerifyIt network"
      />

      {loading ? (
        <Loader />
      ) : (
        data && (
          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-5">
            {/* Score circle */}
            <div className="lg:col-span-1 space-y-4">
              <div className="card text-center">
                <div className="relative w-36 h-36 lg:w-40 lg:h-40 mx-auto mb-4">
                  <svg
                    viewBox="0 0 120 120"
                    className="w-full h-full -rotate-90"
                  >
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="#d0ecd9"
                      strokeWidth="10"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="#0B6E37"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${(data.trustScore / 100) * 314} 314`}
                      style={{ transition: "stroke-dasharray 1s ease" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-display font-800 text-4xl text-gray-900 leading-none">
                      {data.trustScore}
                    </span>
                    <span className="text-xs text-gray-400 mt-1">/ 100</span>
                  </div>
                </div>
                <p
                  className={`font-display font-700 text-xl ${tierColor[data.loanEligibility?.tier] || "text-gray-500"}`}
                >
                  {data.loanEligibility?.tier} Tier
                </p>
                <p className="text-sm text-gray-400 mt-0.5">Trust Score</p>
              </div>

              <div
                className={`card ${data.loanEligibility?.eligible ? "bg-primary-700" : "bg-gray-50"}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp
                    size={15}
                    className={
                      data.loanEligibility?.eligible
                        ? "text-gold-300"
                        : "text-gray-400"
                    }
                  />
                  <span
                    className={`text-sm font-semibold ${data.loanEligibility?.eligible ? "text-primary-100" : "text-gray-500"}`}
                  >
                    First Bank Loan
                  </span>
                </div>
                {data.loanEligibility?.eligible ? (
                  <>
                    <p className="font-display font-800 text-2xl text-white">
                      {data.loanEligibility.amount}
                    </p>
                    <p className="text-xs text-primary-200 mt-1">
                      Available working capital
                    </p>
                    <button className="btn-gold w-full mt-4 text-xs py-2">
                      Apply Now
                    </button>
                  </>
                ) : (
                  <p className="text-sm text-gray-400">
                    Reach a score of <strong>40</strong> to unlock loan
                    eligibility.
                  </p>
                )}
              </div>
            </div>

            {/* Breakdown + tips */}
            <div className="lg:col-span-2 space-y-4 lg:space-y-5">
              <div className="card">
                <h2 className="font-display font-700 text-gray-800 mb-5">
                  Score Breakdown
                </h2>
                <div className="space-y-4">
                  {Object.entries(data.breakdown).map(([key, label]) => (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-semibold text-gray-700 capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                        <span className="text-xs text-gray-400">{label}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full"
                          style={{
                            width: `${data.trustScore}%`,
                            transition: "width 0.8s ease",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h2 className="font-display font-700 text-gray-800 mb-4">
                  How to improve your score
                </h2>
                <div className="space-y-3">
                  {tips.map(({ tip, points }) => (
                    <div
                      key={tip}
                      className="flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Star size={13} className="text-gold-500 shrink-0" />
                        <span className="text-sm text-gray-600 font-body truncate">
                          {tip}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-primary-600 shrink-0 bg-primary-50 px-2 py-0.5 rounded-lg">
                        {points}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </Layout>
  );
}

// ─── Analytics ────────────────────────────────────────────────────────────────
export function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [premiumError, setPremiumError] = useState(false);

  useEffect(() => {
    api
      .get("/analytics/scans")
      .then((r) => setData(r.data))
      .catch((err) => {
        if (err.response?.status === 403) setPremiumError(true);
        else toast.error("Failed to load analytics");
      })
      .finally(() => setLoading(false));
  }, []);

  if (premiumError)
    return (
      <Layout>
        <PageHeader
          title="Analytics"
          subtitle="Scan trends and product insights"
        />
        <div className="card flex flex-col items-center py-16 text-center px-4">
          <div className="w-16 h-16 bg-gold-100 rounded-2xl flex items-center justify-center mb-5">
            <Lock size={28} className="text-gold-600" />
          </div>
          <h2 className="font-display font-700 text-gray-900 text-xl mb-2">
            Premium Feature
          </h2>
          <p className="text-gray-400 text-sm font-body max-w-xs mb-6">
            Upgrade to Premium to unlock detailed scan analytics — daily trends,
            regional breakdowns, and product performance.
          </p>
          <button className="btn-gold">Upgrade to Premium</button>
        </div>
      </Layout>
    );

  return (
    <Layout>
      <PageHeader
        title="Analytics"
        subtitle="Scan activity for the last 30 days"
      />

      {loading ? (
        <Loader />
      ) : (
        data && (
          <>
            <div className="grid grid-cols-2 gap-3 lg:gap-4 mb-5">
              <div className="card p-4 lg:p-6">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Total Scans
                </p>
                <p className="font-display font-800 text-2xl lg:text-3xl text-gray-900">
                  {data.totalScans?.toLocaleString() || "0"}
                </p>
              </div>
              <div className="card p-4 lg:p-6">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Top Product
                </p>
                <p className="font-display font-700 text-lg lg:text-xl text-gray-900 truncate">
                  {data.mostScannedProduct?.name || "—"}
                </p>
                {data.mostScannedProduct && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {data.mostScannedProduct.scans} scans
                  </p>
                )}
              </div>
            </div>

            <div className="card p-4 lg:p-6">
              <h2 className="font-display font-700 text-gray-800 mb-5">
                Daily Scan Trend
              </h2>
              {!data.scanTrend?.length ? (
                <div className="flex flex-col items-center py-12 text-gray-300">
                  <BarChart2 size={36} className="mb-2" />
                  <p className="text-sm text-gray-400">
                    No scan data in the last 30 days
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-end gap-0.5 sm:gap-1 h-36 lg:h-44 mb-3">
                    {data.scanTrend.map((d) => {
                      const max = Math.max(
                        ...data.scanTrend.map((x) => x.count),
                        1,
                      );
                      const pct = (d.count / max) * 100;
                      return (
                        <div
                          key={d._id}
                          className="flex-1 flex flex-col items-center group relative"
                        >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                            {d.count} scan{d.count !== 1 ? "s" : ""}
                          </div>
                          <div
                            className="w-full bg-primary-500 hover:bg-primary-600 rounded-t-md transition-colors cursor-pointer"
                            style={{ height: `${Math.max(pct, 3)}%` }}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{data.scanTrend[0]?._id}</span>
                    <span>
                      {data.scanTrend[data.scanTrend.length - 1]?._id}
                    </span>
                  </div>
                </>
              )}
            </div>
          </>
        )
      )}
    </Layout>
  );
}

// ─── Profile ──────────────────────────────────────────────────────────────────
export function Profile() {
  const { business, refreshBusiness } = useAuth();
  const [loading, setLoading] = useState(false);
  const [pic, setPic] = useState(null);
  const [picPreview, setPicPreview] = useState(null);
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    cacNumber: "",
    nafdacNumber: "",
    ndleaNumber: "",
  });
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    if (business)
      setForm({
        name: business.name || "",
        mobile: business.mobile || "",
        cacNumber: business.cacNumber || "",
        nafdacNumber: business.nafdacNumber || "",
        ndleaNumber: business.ndleaNumber || "",
      });
  }, [business]);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPic(file);
    setPicPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) return toast.error("Business name is required");
    setLoading(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v) fd.append(k, v);
    });
    if (pic) fd.append("profilePicture", pic);
    try {
      await api.patch("/auth/profile", fd);
      await refreshBusiness();
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.error || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const profileImg = picPreview || business?.profilePicture;
  const initials = (business?.name || "BZ")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Layout>
      <PageHeader title="Profile" subtitle="Manage your business account" />

      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-5">
        {/* Photo panel */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card text-center">
            <div className="relative w-28 h-28 lg:w-32 lg:h-32 mx-auto mb-4">
              {profileImg ? (
                <img
                  src={profileImg}
                  alt=""
                  className="w-full h-full rounded-2xl object-cover ring-4 ring-primary-100"
                />
              ) : (
                <div className="w-full h-full rounded-2xl bg-primary-50 ring-4 ring-primary-100 flex items-center justify-center">
                  <span className="font-display font-700 text-3xl text-primary-500">
                    {initials}
                  </span>
                </div>
              )}
              {picPreview && (
                <button
                  onClick={() => {
                    setPic(null);
                    setPicPreview(null);
                  }}
                  className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center shadow-md"
                >
                  <X size={13} className="text-white" />
                </button>
              )}
            </div>
            <label className="cursor-pointer inline-flex items-center gap-1.5 text-sm text-primary-600 font-semibold hover:underline">
              <Upload size={14} />{" "}
              {picPreview ? "Change photo" : "Upload photo"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFile}
              />
            </label>

            <div className="mt-5 pt-5 border-t border-gray-100 space-y-3 text-left">
              {[
                {
                  label: "Business ID",
                  value: `...${business?._id?.slice(-8)}`,
                  mono: true,
                },
                {
                  label: "Account Type",
                  value: business?.isPremium ? "⭐ Premium" : "Basic",
                  highlight: business?.isPremium,
                },
                {
                  label: "Trust Score",
                  value: `${business?.trustScore ?? 0}/100`,
                  score: true,
                },
                {
                  label: "CAC Status",
                  value: business?.cacNumber ? "✓ Provided" : "Not added",
                  cac: !!business?.cacNumber,
                },
              ].map(({ label, value, mono, highlight, score, cac }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">{label}</span>
                  <span
                    className={`text-xs font-semibold ${mono ? "font-mono text-gray-600" : ""} ${highlight ? "text-gold-600" : ""} ${score ? "text-primary-700" : ""} ${cac !== undefined ? (cac ? "text-primary-600" : "text-amber-600") : ""}`}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={onSubmit}
          className="lg:col-span-2 space-y-4 lg:space-y-5"
        >
          <div className="card space-y-4">
            <h2 className="font-display font-700 text-gray-800">
              Business Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormGroup label="Business Name *">
                <input
                  className="input"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                />
              </FormGroup>
              <FormGroup label="Mobile Number">
                <input
                  className="input"
                  placeholder="08012345678"
                  value={form.mobile}
                  onChange={(e) => set("mobile", e.target.value)}
                />
              </FormGroup>
            </div>
            <FormGroup label="Email Address">
              <input
                className="input bg-gray-50 cursor-not-allowed"
                value={business?.email || ""}
                disabled
              />
              <p className="text-xs text-gray-400 mt-1.5">
                Email cannot be changed
              </p>
            </FormGroup>
          </div>

          <div className="card space-y-4">
            <div>
              <h2 className="font-display font-700 text-gray-800">
                Regulatory Numbers
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                These boost your Trust Score and loan eligibility.
              </p>
            </div>
            <FormGroup label="CAC Registration Number">
              <input
                className="input"
                placeholder="RC-123456 or BN-123456"
                value={form.cacNumber}
                onChange={(e) => set("cacNumber", e.target.value)}
              />
            </FormGroup>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormGroup label="NAFDAC Number">
                <input
                  className="input"
                  placeholder="A1-1234"
                  value={form.nafdacNumber}
                  onChange={(e) => set("nafdacNumber", e.target.value)}
                />
              </FormGroup>
              <FormGroup label="NDLEA Number">
                <input
                  className="input"
                  placeholder="Optional"
                  value={form.ndleaNumber}
                  onChange={(e) => set("ndleaNumber", e.target.value)}
                />
              </FormGroup>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full spin" />
            ) : (
              <>
                <Save size={16} /> Save Changes
              </>
            )}
          </button>
        </form>
      </div>
    </Layout>
  );
}
