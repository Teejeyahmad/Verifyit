import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Zap,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Lock,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error("Fill in all fields");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      login(res.data.business);
      toast.success(`Welcome back, ${res.data.business.name}!`);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-cream">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-5/12 bg-primary-700 flex-col justify-between p-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gold-500 rounded-xl flex items-center justify-center">
            <Zap size={17} className="text-white" />
          </div>
          <span className="text-white font-display font-700 text-xl">
            VerifyIt
          </span>
        </div>

        <div>
          <h2 className="text-4xl font-display font-800 text-white leading-snug mb-5">
            Nigeria's trusted
            <br />
            product verification
            <br />
            <span className="text-gold-300">& fintech platform</span>
          </h2>
          <p className="text-primary-200 text-base leading-relaxed mb-10 font-body">
            Authenticate products, protect your customers, and unlock First
            Bank–powered financing from one dashboard.
          </p>

          <div className="space-y-4">
            {[
              { icon: ShieldCheck, text: "QR-powered product authentication" },
              {
                icon: TrendingUp,
                text: "Invoice discounting & working capital loans",
              },
              { icon: Lock, text: "Escrow payments for safe transactions" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shrink-0">
                  <Icon size={15} className="text-gold-300" />
                </div>
                <span className="text-primary-100 text-sm font-body">
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-primary-400 text-xs font-body">
          Powered by First Bank Nigeria · CAC & NAFDAC Verified
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 bg-primary-700 rounded-lg flex items-center justify-center">
              <Zap size={14} className="text-white" />
            </div>
            <span className="font-display font-700 text-primary-700 text-lg">
              VerifyIt
            </span>
          </div>

          <h1 className="text-2xl font-display font-700 text-gray-900 mb-1">
            Sign in
          </h1>
          <p className="text-gray-400 text-sm font-body mb-8">
            Access your business dashboard
          </p>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="label">Email address</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                placeholder="business@email.com"
                className="input"
                autoComplete="email"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label !mb-0">Password</label>
              </div>
              <div className="relative">
                <input
                  name="password"
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={onChange}
                  placeholder="••••••••"
                  className="input pr-12"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-8 font-body">
            New business?{" "}
            <Link
              to="/register"
              className="text-primary-600 font-semibold hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
