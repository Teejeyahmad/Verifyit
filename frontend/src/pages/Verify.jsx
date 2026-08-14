import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Zap,
  Package,
  Calendar,
  Hash,
  Building2,
  ScanLine,
} from "lucide-react";
import api from "../api/axios";

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
    <Icon size={15} className="text-gray-400 shrink-0 mt-0.5" />
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-semibold text-gray-900 capitalize mt-0.5">
        {value}
      </p>
    </div>
  </div>
);

export default function Verify() {
  const { productId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const isCarton = window.location.pathname.includes("/carton");

  useEffect(() => {
    console.log("from VERIFYproductId : ", productId);
    api
      .get(isCarton ? `/verify/${productId}/carton` : `/verify/${productId}`)
      .then((r) => setResult(r.data))
      .catch((err) =>
        setResult(
          err.response?.data || {
            verified: false,
            message: "Verification failed.",
          },
        ),
      )
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading)
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary-200 border-t-primary-700 spin" />
        <p className="text-gray-500 text-sm">Verifying product...</p>
      </div>
    );

  const isVerified = result?.verified;
  const isWarning = isVerified && result.product?.prevScannedAt; // First scan is fine, subsequent scans trigger a warning
  const product = result?.product;

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Header */}
      <header className="bg-primary-700 px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gold-500 rounded-lg flex items-center justify-center">
            <Zap size={13} className="text-white" />
          </div>
          <span className="text-white font-display font-700 text-base">
            VerifyIt
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-2.5 py-1.5">
          <ShieldCheck size={12} className="text-gold-300" />
          <span className="text-white text-xs font-semibold">Product Scan</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-start sm:justify-center px-4 py-6">
        <div className="w-full max-w-md">
          {/* Status banner */}
          <div
            className={`rounded-2xl p-5 sm:p-6 text-center mb-4 ${
              isVerified && !isWarning
                ? "bg-primary-700"
                : isWarning
                  ? "bg-amber-500"
                  : "bg-red-600"
            }`}
          >
            <div className="flex justify-center mb-3">
              {isVerified && !isWarning && (
                <CheckCircle2 size={44} className="text-white" />
              )}
              {isWarning && <AlertTriangle size={44} className="text-white" />}
              {!isVerified && <XCircle size={44} className="text-white" />}
            </div>
            <h1 className="font-display font-800 text-xl sm:text-2xl text-white mb-1">
              {isVerified && !isWarning && "Product Verified ✓"}
              {isWarning && "Already Scanned"}
              {!isVerified && "Not Verified"}
            </h1>
            <p className="text-white/80 text-sm leading-relaxed">
              {result?.message ||
                (isVerified
                  ? "This product is authentic."
                  : "Could not verify this product.")}
            </p>
          </div>

          {/* Product details */}
          {isVerified && product && (
            <div className="bg-white rounded-2xl shadow-card overflow-hidden mb-4">
              {product.images?.length > 0 && (
                <div className="flex gap-2 p-4 pb-0 overflow-x-auto">
                  {product.images.slice(0, 5).map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt=""
                      className="w-20 h-20 rounded-xl object-cover shrink-0"
                    />
                  ))}
                </div>
              )}
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="min-w-0">
                    <h2 className="font-display font-700 text-gray-900 text-lg leading-tight truncate">
                      {product.name}
                    </h2>
                    {product.description && (
                      <p className="text-sm text-gray-400 mt-0.5 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                  </div>
                  {product.category && (
                    <span className="tag-green shrink-0">
                      {product.category}
                    </span>
                  )}
                </div>

                {product.registeredBy && (
                  <InfoRow
                    icon={Building2}
                    label="Registered by"
                    value={product.registeredBy}
                  />
                )}
                {product.cacNumber && (
                  <InfoRow
                    icon={Hash}
                    label="CAC Number"
                    value={product.cacNumber}
                  />
                )}
                {product.nafdacNumber && (
                  <InfoRow
                    icon={Hash}
                    label="NAFDAC Number"
                    value={product.nafdacNumber}
                  />
                )}
                {product.batch && (
                  <InfoRow
                    icon={Package}
                    label="Batch Number"
                    value={product.batch}
                  />
                )}
                {product.expiryDate && (
                  <InfoRow
                    icon={Calendar}
                    label="Expiry Date"
                    value={new Date(product.expiryDate).toLocaleDateString(
                      "en-GB",
                      { day: "numeric", month: "long", year: "numeric" },
                    )}
                  />
                )}
                <InfoRow
                  icon={Calendar}
                  label="Registered on"
                  value={new Date(product.createdAt).toLocaleDateString(
                    "en-GB",
                    { day: "numeric", month: "long", year: "numeric" },
                  )}
                />
              </div>
            </div>
          )}

          {/* Not verified */}
          {!isVerified && (
            <div className="bg-white rounded-2xl shadow-card p-5 text-center mb-4">
              <Package size={32} className="text-gray-200 mx-auto mb-3" />
              <h3 className="font-display font-700 text-gray-700 mb-2">
                Product not found
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                This QR code could not be matched to any registered product. It
                may be counterfeit or tampered.{" "}
                <strong>Do not purchase or consume this product.</strong>
              </p>
            </div>
          )}

          {/* Scan count */}
          {isVerified && (
            <div className="flex items-center justify-center gap-2 text-gray-400 text-xs mb-4">
              <ScanLine size={13} />
              <span>
                Scanned {result?.product?.scanCount || 0} time
                {(result?.product?.scanCount || 0) !== 1 ? "s" : ""}
              </span>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 bg-primary-700 rounded-md flex items-center justify-center">
              <Zap size={10} className="text-white" />
            </div>
            <span className="text-xs text-gray-400">
              Powered by <strong>VerifyIt</strong>
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
