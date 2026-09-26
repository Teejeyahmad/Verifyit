import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import QRScanner from "../components/QRScanner";
import { useQRScan } from "../hooks/useQRScan";
import {
  Zap,
  ShieldCheck,
  ScanLine,
  QrCode,
  ArrowRight,
  CheckCircle2,
  Package,
  Smartphone,
  Building2,
  Menu,
  X,
} from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const { handleScan } = useQRScan();

  const handleVerify = (e) => {
    e.preventDefault();
    const clean = code.trim();
    if (!clean) return;
    navigate(`/verify/${clean}`);
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* ── Nav ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-cream/90 backdrop-blur-md border-b border-gray-200/60">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-700 rounded-lg flex items-center justify-center">
              <Zap size={15} className="text-white" />
            </div>
            <span className="font-display font-700 text-primary-700 text-lg">
              VerifyIt
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#how-it-works"
              className="text-sm font-semibold text-gray-600 hover:text-primary-700 transition-colors"
            >
              How it works
            </a>
            <a
              href="#features"
              className="text-sm font-semibold text-gray-600 hover:text-primary-700 transition-colors"
            >
              Features
            </a>
            <a
              href="#verify"
              className="text-sm font-semibold text-gray-600 hover:text-primary-700 transition-colors"
            >
              Verify a product
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-semibold text-gray-700 hover:text-primary-700 px-3 py-2 transition-colors"
            >
              Sign in
            </Link>
            <Link to="/register" className="btn-primary text-sm px-5 py-2.5">
              Get started <ArrowRight size={15} />
            </Link>
          </div>

          <button
            onClick={() => setMenuOpen(true)}
            className="md:hidden p-2 text-gray-700"
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          <div className="h-16 flex items-center justify-between px-5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-700 rounded-lg flex items-center justify-center">
                <Zap size={15} className="text-white" />
              </div>
              <span className="font-display font-700 text-primary-700 text-lg">
                VerifyIt
              </span>
            </div>
            <button
              onClick={() => setMenuOpen(false)}
              className="p-2 text-gray-700"
            >
              <X size={22} />
            </button>
          </div>
          <nav className="flex flex-col gap-1 p-5">
            <a
              onClick={() => setMenuOpen(false)}
              href="#how-it-works"
              className="px-4 py-3.5 text-base font-semibold text-gray-700 rounded-xl hover:bg-gray-50"
            >
              How it works
            </a>
            <a
              onClick={() => setMenuOpen(false)}
              href="#features"
              className="px-4 py-3.5 text-base font-semibold text-gray-700 rounded-xl hover:bg-gray-50"
            >
              Features
            </a>
            <a
              onClick={() => setMenuOpen(false)}
              href="#verify"
              className="px-4 py-3.5 text-base font-semibold text-gray-700 rounded-xl hover:bg-gray-50"
            >
              Verify a product
            </a>
            <div className="h-px bg-gray-100 my-3" />
            <Link
              onClick={() => setMenuOpen(false)}
              to="/login"
              className="px-4 py-3.5 text-base font-semibold text-gray-700 rounded-xl hover:bg-gray-50"
            >
              Sign in
            </Link>
            <Link
              onClick={() => setMenuOpen(false)}
              to="/register"
              className="btn-primary justify-center py-3.5 mt-1"
            >
              Get started <ArrowRight size={16} />
            </Link>
          </nav>
        </div>
      )}

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-100 rounded-full blur-3xl opacity-40 -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold-100 rounded-full blur-3xl opacity-40 translate-y-1/4 -translate-x-1/4" />

        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 pt-16 sm:pt-24 pb-20 sm:pb-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-100 rounded-full px-4 py-1.5 mb-6">
              <ShieldCheck size={14} className="text-primary-600" />
              <span className="text-xs font-semibold text-primary-700">
                Built for Nigerian businesses
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-display font-800 text-gray-900 leading-[1.08] mb-6">
              Know it's real.
              <br />
              <span className="text-primary-600">Every time.</span>
            </h1>

            <p className="text-lg text-gray-500 leading-relaxed mb-9 max-w-xl font-body">
              VerifyIt lets businesses generate secure QR codes for every
              product, and lets anyone verify authenticity instantly — right
              from their phone, no app required.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/register"
                className="btn-primary justify-center py-3.5 px-7 text-base"
              >
                Register your business <ArrowRight size={17} />
              </Link>
              <button
                onClick={() => setScanning(true)}
                className="btn-secondary justify-center py-3.5 px-7 text-base"
              >
                <ScanLine size={17} /> Verify a product
              </button>
            </div>

            <div className="flex items-center gap-6 mt-10">
              {[
                { icon: QrCode, label: "Unique QR per product" },
                { icon: Smartphone, label: "No app needed" },
                { icon: CheckCircle2, label: "Instant results" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="hidden sm:flex items-center gap-2">
                  <Icon size={16} className="text-primary-500" />
                  <span className="text-xs font-semibold text-gray-500">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────── */}
      <section
        id="how-it-works"
        className="py-20 sm:py-28 bg-white border-y border-gray-100"
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="text-center max-w-xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-display font-800 text-gray-900 mb-3">
              How it works
            </h2>
            <p className="text-gray-500 font-body">
              Three simple steps between a real product and real peace of mind.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Package,
                step: "01",
                title: "Register your product",
                desc: "Add your product details on your dashboard — name, batch, category, expiry date, and regulatory info.",
              },
              {
                icon: QrCode,
                step: "02",
                title: "Get your QR codes",
                desc: "We instantly generate a unique QR code for the product unit, and a second one for bulk carton packaging.",
              },
              {
                icon: ScanLine,
                step: "03",
                title: "Customers verify instantly",
                desc: "Anyone can scan the code with their phone camera and get an immediate, reliable authenticity result.",
              },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div
                key={step}
                className="card hover:shadow-elevated transition-shadow duration-200"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                    <Icon size={22} className="text-primary-600" />
                  </div>
                  <span className="text-3xl font-display font-800 text-gray-100">
                    {step}
                  </span>
                </div>
                <h3 className="font-display font-700 text-gray-900 text-lg mb-2">
                  {title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed font-body">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────── */}
      <section id="features" className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="text-center max-w-xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-display font-800 text-gray-900 mb-3">
              Everything you need to protect your brand
            </h2>
            <p className="text-gray-500 font-body">
              Built specifically for how products actually move through Nigerian
              supply chains.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: QrCode,
                title: "Unit & Carton QR Codes",
                desc: "Separate codes for individual packs and bulk retailer shipments, generated automatically.",
              },
              {
                icon: ScanLine,
                title: "Repeat-Scan Detection",
                desc: "We flag when a code has already been scanned before — an early signal of possible duplication.",
              },
              {
                icon: Building2,
                title: "Business Verification",
                desc: "Display your CAC and NAFDAC registration details to build instant consumer trust.",
              },
              {
                icon: Smartphone,
                title: "No App Required",
                desc: "Consumers verify straight from their phone camera and browser — zero friction, zero downloads.",
              },
              {
                icon: ShieldCheck,
                title: "Secure by Design",
                desc: "Every product record is protected behind authenticated business accounts and encrypted sessions.",
              },
              {
                icon: CheckCircle2,
                title: "Real-Time Results",
                desc: "Verification happens in seconds, whether scanned by phone or our dedicated hardware scanner.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="p-6 rounded-2xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all duration-200"
              >
                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
                  <Icon size={18} className="text-primary-600" />
                </div>
                <h3 className="font-display font-700 text-gray-900 mb-1.5">
                  {title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed font-body">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Verify a product (public utility) ──────────────────── */}
      <section id="verify" className="py-20 sm:py-28 bg-primary-700">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 text-center">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ScanLine size={26} className="text-gold-300" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-800 text-white mb-3">
            Got a product in hand?
          </h2>
          <p className="text-primary-200 font-body mb-8">
            Scan the QR code on the packaging to verify it right now — no code
            to type, no app to install.
          </p>

          <button
            onClick={() => setScanning(true)}
            className="btn-gold py-3.5 px-8 text-base mx-auto"
          >
            <ScanLine size={18} /> Scan to verify
          </button>

          <p className="text-primary-300 text-xs mt-4 font-body">
            Works directly in your browser — just allow camera access when
            prompted.
          </p>
        </div>
      </section>

      {/* Scanner overlay */}
      {scanning && (
        <QRScanner
          onScan={(text) => {
            setScanning(false);
            handleScan(text);
          }}
          onClose={() => setScanning(false)}
        />
      )}

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-display font-800 text-gray-900 mb-4">
            Ready to protect your products?
          </h2>
          <p className="text-gray-500 font-body mb-9 max-w-md mx-auto">
            Join businesses using VerifyIt to give their customers real
            confidence at the point of purchase.
          </p>
          <Link
            to="/register"
            className="btn-primary inline-flex py-3.5 px-8 text-base"
          >
            Create your free account <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 py-10">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary-700 rounded-lg flex items-center justify-center">
              <Zap size={13} className="text-white" />
            </div>
            <span className="font-display font-700 text-primary-700">
              VerifyIt
            </span>
          </div>
          <p className="text-xs text-gray-400 font-body">
            © {new Date().getFullYear()} VerifyIt. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
