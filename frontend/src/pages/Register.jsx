import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Zap,
  ArrowRight,
  ArrowLeft,
  Upload,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import validator from "validator";

const steps = ["Business Info", "Regulatory", "Account"];

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [picPreview, setPicPreview] = useState(null);

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    password: "",
    cacNumber: "",
    nafdacNumber: "",
    ndleaNumber: "",
    profilePicture: null,
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    set("profilePicture", file);
    setPicPreview(URL.createObjectURL(file));
  };

  const nextStep = () => {
    if (step === 0) {
      if (!form.name) return toast.error("Business Name required");
      if (!form.name.match(/[a-zA-Z0-9]{2,30}/))
        return toast.error("Business Name must be between 2 to 30 characters");
      if (!form.mobile) return toast.error("Mobile number is required");
      if (!validator.isMobilePhone(form.mobile, "en-NG"))
        return toast.error("Invalid mobile number");
    }
    setStep((s) => s + 1);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (step === 2 && !validator.isEmail(form.email))
      return toast.error("Invalid email address");
    if (step === 2 && !validator.isStrongPassword(form.password))
      return toast.error("Strong Password is required");

    setLoading(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v) fd.append(k, v);
    });

    try {
      const res = await api.post("/auth/register", fd);
      login(res.data.business);
      toast.success("Business registered! Welcome to VerifyIt.");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 bg-primary-700 rounded-lg flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <span className="font-display font-700 text-primary-700 text-lg">
            VerifyIt
          </span>
        </div>

        <div className="card">
          <h1 className="text-xl font-display font-700 text-gray-900 mb-1">
            Register your business
          </h1>
          <p className="text-sm text-gray-400 font-body mb-6">
            Join Nigeria's verified commerce network
          </p>

          {/* Step indicators */}
          <div className="flex items-center gap-2 mb-8">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-display font-700 transition-all
                  ${
                    i < step
                      ? "bg-primary-700 text-white"
                      : i === step
                        ? "bg-primary-100 text-primary-700 ring-2 ring-primary-300"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {i < step ? "✓" : i + 1}
                </div>
                <span
                  className={`text-xs font-semibold hidden sm:block ${i === step ? "text-primary-700" : "text-gray-400"}`}
                >
                  {s}
                </span>
                {i < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 ${i < step ? "bg-primary-500" : "bg-gray-200"}`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step 0 — Business Info */}
          {step === 0 && (
            <div className="space-y-4">
              {/* Profile picture */}
              <div className="flex flex-col items-center gap-3 mb-2">
                <div className="relative">
                  {picPreview ? (
                    <img
                      src={picPreview}
                      alt=""
                      className="w-20 h-20 rounded-2xl object-cover ring-4 ring-primary-100"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-primary-50 flex items-center justify-center ring-4 ring-primary-100">
                      <Upload size={22} className="text-primary-400" />
                    </div>
                  )}
                  {picPreview && (
                    <button
                      onClick={() => {
                        setPicPreview(null);
                        set("profilePicture", null);
                      }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                    >
                      <X size={12} className="text-white" />
                    </button>
                  )}
                </div>
                <label className="cursor-pointer text-sm text-primary-600 font-semibold hover:underline">
                  {picPreview ? "Change photo" : "Upload logo / profile photo"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFile}
                  />
                </label>
              </div>

              <div>
                <label className="label">
                  Business Name <span className="text-red-400">*</span>
                </label>
                <input
                  required
                  className="input"
                  placeholder="PharmaCo Nigeria Ltd"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                />
              </div>
              <div>
                <label className="label">
                  Mobile Number <span className="text-red-400">*</span>
                </label>
                <input
                  required
                  className="input"
                  placeholder="08012345678"
                  value={form.mobile}
                  onChange={(e) => set("mobile", e.target.value)}
                />
              </div>

              <button
                type="button"
                onClick={nextStep}
                className="btn-primary w-full mt-2"
              >
                Continue <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* Step 1 — Regulatory */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 mb-2">
                <p className="text-sm text-primary-700 font-body">
                  <span className="font-semibold">
                    Optional but recommended.
                  </span>{" "}
                  Adding your regulatory numbers increases your Trust Score and
                  unlocks higher loan limits.
                </p>
              </div>

              <div>
                <label className="label">CAC Registration Number</label>
                <input
                  className="input"
                  placeholder="RC-123456"
                  value={form.cacNumber}
                  onChange={(e) => set("cacNumber", e.target.value)}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Your Corporate Affairs Commission number
                </p>
              </div>
              <div>
                <label className="label">NAFDAC Registration Number</label>
                <input
                  className="input"
                  placeholder="A1-1234"
                  value={form.nafdacNumber}
                  onChange={(e) => set("nafdacNumber", e.target.value)}
                />
              </div>
              <div>
                <label className="label">NDLEA Registration Number</label>
                <input
                  className="input"
                  placeholder="Optional"
                  value={form.ndleaNumber}
                  onChange={(e) => set("ndleaNumber", e.target.value)}
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="btn-secondary flex-1"
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn-primary flex-1"
                >
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 2 — Account credentials */}
          {step === 2 && (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="label">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  className="input"
                  type="email"
                  required
                  placeholder="you@business.com"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="label">
                  Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    required
                    className="input pr-12"
                    type={showPass ? "text" : "password"}
                    placeholder="At least 8 characters"
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                    autoComplete="new-password"
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

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-secondary flex-1"
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full spin" />
                  ) : (
                    <>
                      <span>Register</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-400 mt-6 font-body">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-primary-600 font-semibold hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
