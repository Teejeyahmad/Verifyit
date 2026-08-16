import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";

// Layout — desktop: ml-60 for sidebar. Mobile: pt-14 for top header, pb-20 for bottom tab bar
export const Layout = ({ children }) => (
  <div className="flex min-h-screen bg-cream">
    <Sidebar />
    <main className="flex-1 lg:ml-60 min-h-screen pt-14 lg:pt-0 pb-20 lg:pb-0">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5 lg:py-8 page-enter">
        {children}
      </div>
    </main>
  </div>
);

export const PageHeader = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between mb-5 lg:mb-7 gap-3">
    <div className="min-w-0">
      <h1 className="text-xl lg:text-2xl font-display font-700 text-gray-900 truncate">
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm text-gray-500 mt-0.5 font-body hidden sm:block">
          {subtitle}
        </p>
      )}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

export const StatCard = ({
  label,
  value,
  icon: Icon,
  color = "green",
  sub,
}) => {
  const colors = {
    green: "bg-primary-50 text-primary-700",
    gold: "bg-gold-100 text-gold-700",
    blue: "bg-blue-50 text-blue-700",
    purple: "bg-purple-50 text-purple-700",
    red: "bg-red-50 text-red-600",
  };
  return (
    <div className="card flex items-start gap-3 hover:shadow-elevated transition-shadow duration-200">
      <div
        className={`w-10 h-10 lg:w-11 lg:h-11 rounded-xl flex items-center justify-center shrink-0 ${colors[color]}`}
      >
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5 truncate">
          {label}
        </p>
        <p className="text-xl lg:text-2xl font-display font-700 text-gray-900 leading-none">
          {value}
        </p>
        {sub && <p className="text-xs text-gray-400 mt-1 truncate">{sub}</p>}
      </div>
    </div>
  );
};

export const EmptyState = ({ icon: Icon, title, subtitle, action }) => (
  <div className="flex flex-col items-center justify-center py-16 lg:py-20 text-center px-4">
    <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mb-4">
      <Icon size={26} className="text-primary-400" />
    </div>
    <h3 className="font-display font-700 text-gray-700 text-lg mb-1">
      {title}
    </h3>
    <p className="text-gray-400 text-sm font-body mb-6 max-w-xs">{subtitle}</p>
    {action}
  </div>
);

export const Loader = ({ text = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center py-24 gap-3">
    <div className="w-9 h-9 rounded-full border-4 border-primary-100 border-t-primary-600 spin" />
    <p className="text-sm text-gray-400 font-body">{text}</p>
  </div>
);

export const FormGroup = ({ label, children, error }) => (
  <div>
    <label className="label">{label}</label>
    {children}
    {error && <p className="text-xs text-red-500 mt-1.5 font-body">{error}</p>}
  </div>
);

export const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-elevated w-full sm:max-w-lg max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="font-display font-700 text-gray-900 text-base lg:text-lg">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            ×
          </button>
        </div>
        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  );
};

export const Lightbox = ({ images, startIndex = 0, onClose }) => {
  const [current, setCurrent] = useState(startIndex);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const prev = (e) => {
    e.stopPropagation();
    setCurrent((i) => (i - 1 + images.length) % images.length);
  };
  const next = (e) => {
    e.stopPropagation();
    setCurrent((i) => (i + 1) % images.length);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
      >
        ✕
      </button>

      {/* Counter */}
      {images.length > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/10 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
          {current + 1} / {images.length}
        </div>
      )}

      {/* Prev button */}
      {images.length > 1 && (
        <button
          onClick={prev}
          className="absolute left-3 sm:left-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white text-xl transition-colors"
        >
          ‹
        </button>
      )}

      {/* Main image */}
      <img
        src={images[current]}
        alt=""
        onClick={(e) => e.stopPropagation()}
        className="max-w-[90vw] max-h-[85vh] rounded-xl object-contain shadow-2xl"
        style={{ animation: "fadeUp 0.2s ease both" }}
      />

      {/* Next button */}
      {images.length > 1 && (
        <button
          onClick={next}
          className="absolute right-3 sm:right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white text-xl transition-colors"
        >
          ›
        </button>
      )}

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, i) => (
            <button key={i} onClick={() => setCurrent(i)}>
              <img
                src={img}
                alt=""
                className={`w-12 h-12 rounded-lg object-cover transition-all ${
                  i === current
                    ? "ring-2 ring-white opacity-100"
                    : "opacity-40 hover:opacity-70"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
