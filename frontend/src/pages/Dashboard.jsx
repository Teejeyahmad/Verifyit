import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Package,
  QrCode,
  Star,
  ScanLine,
  Plus,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import {
  Layout,
  PageHeader,
  StatCard,
  Loader,
  EmptyState,
} from "../components/UI";

export default function Dashboard() {
  const { business } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [trustData, setTrustData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/products")
      .then((response) => {
        setProducts(response.data.products.slice(0, 5));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalScans = products.reduce((s, p) => s + (p.scanCount || 0), 0);

  return (
    <Layout>
      <PageHeader
        title={`Good day, ${business?.name?.split(" ")[0]} 👋`}
        subtitle="Here's what's happening with your products"
        action={
          products.length !== 0 ? (
            <Link
              to="/products/add"
              className="btn-primary text-xs sm:text-sm px-3 sm:px-5"
            >
              <Plus size={15} />{" "}
              <span className="hidden sm:inline">Add Product</span>
              <span className="sm:hidden">Add</span>
            </Link>
          ) : (
            ""
          )
        }
      />

      {loading ? (
        <Loader />
      ) : (
        <>
          {/* Stats — 2 cols on mobile, 4 on desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 lg:gap-4 mb-5 lg:mb-8">
            <StatCard
              label="Products"
              value={products.length}
              icon={Package}
              color="green"
            />
            <StatCard
              label="Scans"
              value={totalScans.toLocaleString()}
              icon={ScanLine}
              color="blue"
            />
            {/* <StatCard
              label="Trust Score"
              value={`${trustData?.trustScore ?? business?.trustScore ?? 0}/100`}
              icon={Star} color="gold"
              sub={trustData?.loanEligibility?.tier !== 'None' ? `${trustData?.loanEligibility?.tier} tier` : undefined}
            />
            <StatCard
              label="Loan"
              value={trustData?.loanEligibility?.eligible ? trustData.loanEligibility.amount : '—'}
              icon={ArrowRight} color="purple"
              sub={trustData?.loanEligibility?.eligible ? 'Available' : 'Score too low'}
            /> */}
          </div>

          {/* CAC alert */}
          {!business?.cacNumber && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3 lg:p-4 mb-5">
              <AlertCircle
                size={17}
                className="text-amber-600 shrink-0 mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-amber-700">
                  Complete your profile
                </p>
                <p className="text-xs text-amber-600 mt-0.5 hidden sm:block">
                  Add your CAC number to increase your Trust Score.
                </p>
              </div>
              <Link
                to="/profile"
                className="text-xs font-semibold text-amber-700 hover:underline shrink-0"
              >
                Update →
              </Link>
            </div>
          )}

          {/* Recent products */}
          <div className="card p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-700 text-gray-900 text-base">
                Recent Products
              </h2>
              <Link
                to="/products"
                className="text-sm text-primary-600 font-semibold hover:underline flex items-center gap-1"
              >
                All <ArrowRight size={13} />
              </Link>
            </div>

            {products.length === 0 ? (
              <EmptyState
                icon={Package}
                title="No products yet"
                subtitle="Add your first product to generate a QR code"
                action={
                  <Link to="/products/add" className="btn-primary">
                    <Plus size={16} /> Add product
                  </Link>
                }
              />
            ) : (
              <div className="space-y-2 lg:space-y-3">
                {products.map((p) => (
                  <div
                    key={p._id}
                    onClick={() => navigate(`/products/${p._id}`)}
                    className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50/30 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {p.images?.[0] ? (
                        <img
                          src={p.images[0]}
                          alt=""
                          className="w-9 h-9 rounded-lg object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                          <Package size={16} className="text-primary-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-primary-700 transition-colors">
                          {p.name}
                        </p>
                        <p className="text-xs text-gray-400 capitalize hidden sm:block">
                          {p.category} · {p.batch || "No batch"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 lg:gap-4 shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-gray-700">
                          {p.scanCount || 0}
                        </p>
                        <p className="text-xs text-gray-400">scans</p>
                      </div>
                      {p.unitQrCode ? (
                        <span className="tag-green hidden sm:inline-flex">
                          <QrCode size={11} /> Ready
                        </span>
                      ) : (
                        <span className="tag-amber hidden sm:inline-flex">
                          Pending
                        </span>
                      )}
                      <ArrowRight
                        size={14}
                        className="text-gray-300 group-hover:text-primary-500 transition-colors"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Trust score breakdown */}
          {trustData && (
            <div className="card p-4 lg:p-6 mt-4">
              <h2 className="font-display font-700 text-gray-900 mb-4">
                Trust Score Breakdown
              </h2>
              <div className="space-y-3">
                {Object.entries(trustData.breakdown).map(([key, label]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between text-sm gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <CheckCircle2
                        size={14}
                        className="text-primary-500 shrink-0"
                      />
                      <span className="capitalize text-gray-600 font-body truncate">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                    </div>
                    <span className="text-gray-400 text-xs shrink-0">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-500">Overall score</span>
                  <span className="text-sm font-display font-700 text-primary-700">
                    {trustData.trustScore}/100
                  </span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-gold-500 rounded-full transition-all duration-700"
                    style={{ width: `${trustData.trustScore}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
