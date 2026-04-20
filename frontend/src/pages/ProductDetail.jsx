import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, QrCode, Package, Download, ScanLine, Calendar, Hash } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { Layout, PageHeader, Loader } from '../components/UI';

const QRPanel = ({ title, qrCode, productId, type }) => {
  const download = () => {
    const a = document.createElement('a');
    a.href = qrCode;
    a.download = `verifyit-${type}-${productId}.png`;
    a.click();
  };
  return (
    <div className="card text-center">
      <div className="flex items-center justify-center gap-2 mb-4">
        <QrCode size={15} className="text-primary-600" />
        <h3 className="font-display font-700 text-gray-800 text-sm">{title}</h3>
      </div>
      {qrCode ? (
        <>
          <div className="inline-block p-3 bg-white border border-gray-100 rounded-xl shadow-card mb-4">
            <img src={qrCode} alt={title} className="w-32 h-32 sm:w-36 sm:h-36" />
          </div>
          <button onClick={download} className="btn-secondary w-full text-xs">
            <Download size={13} /> Download
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center py-8 gap-2 text-gray-300">
          <QrCode size={32} />
          <p className="text-xs text-gray-400">Not generated yet</p>
        </div>
      )}
    </div>
  );
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(r => setProduct(r.data.product))
      .catch(() => { toast.error('Product not found'); navigate('/products'); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Layout><Loader /></Layout>;
  if (!product) return null;

  const infoRows = [
    { label: 'Category',      value: product.category,     icon: Package  },
    { label: 'Batch',         value: product.batch,         icon: Hash     },
    { label: 'Expiry Date',   value: product.expiryDate ? new Date(product.expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : null, icon: Calendar },
    { label: 'NAFDAC No.',    value: product.nafdacNumber,  icon: Hash     },
    { label: 'NDLEA No.',     value: product.ndleaNumber,   icon: Hash     },
    { label: 'Total Scans',   value: String(product.scanCount || 0), icon: ScanLine },
    { label: 'First Scanned', value: product.firstScannedAt ? new Date(product.firstScannedAt).toLocaleDateString() : 'Not yet', icon: Calendar },
  ];

  return (
    <Layout>
      <PageHeader
        title={product.name}
        subtitle={`Added ${new Date(product.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`}
        action={
          <button onClick={() => navigate('/products')} className="btn-secondary text-xs sm:text-sm px-3 sm:px-5">
            <ArrowLeft size={15} /> Back
          </button>
        }
      />

      {/* Stack on mobile, side-by-side on desktop */}
      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-5">

        {/* ── Main info (full width mobile, 2/3 desktop) ── */}
        <div className="lg:col-span-2 space-y-4 lg:space-y-5">

          {/* QR codes — shown inline on mobile at top */}
          <div className="grid grid-cols-2 gap-4 lg:hidden">
            <QRPanel title="Unit QR" qrCode={product.unitQrCode} productId={product._id} type="unit" />
            <QRPanel title="Carton QR" qrCode={product.cartonQrCode} productId={product._id} type="carton" />
          </div>

          {product.images?.length > 0 && (
            <div className="card p-4 lg:p-6">
              <h2 className="font-display font-700 text-gray-800 mb-4">Images</h2>
              <div className="flex gap-2 flex-wrap">
                {product.images.map((img, i) => (
                  <img key={i} src={img} alt="" className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-xl object-cover ring-1 ring-gray-100" />
                ))}
              </div>
            </div>
          )}

          <div className="card p-4 lg:p-6">
            <h2 className="font-display font-700 text-gray-800 mb-4">Product Information</h2>
            {product.description && (
              <p className="text-sm text-gray-500 mb-5 leading-relaxed">{product.description}</p>
            )}
            <div className="space-y-0">
              {infoRows.map(({ label, value, icon: Icon }) => value && (
                <div key={label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 gap-3">
                  <div className="flex items-center gap-2 text-gray-500 shrink-0">
                    <Icon size={13} />
                    <span className="text-sm">{label}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-800 capitalize text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-700 text-gray-800">Scan Activity</h2>
              <div className="flex items-center gap-2 bg-primary-50 px-3 py-2 rounded-xl">
                <ScanLine size={15} className="text-primary-600" />
                <span className="font-display font-700 text-primary-700">{product.scanCount || 0}</span>
                <span className="text-xs text-primary-500 hidden sm:inline">total scans</span>
              </div>
            </div>
            {product.firstScannedAt && (
              <p className="text-xs text-gray-400 mt-3 font-body">
                First scanned {new Date(product.firstScannedAt).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>
        </div>

        {/* ── QR panels — desktop only (hidden on mobile, shown above) ── */}
        <div className="hidden lg:flex lg:col-span-1 flex-col gap-4">
          <QRPanel title="Unit QR Code" qrCode={product.unitQrCode} productId={product._id} type="unit" />
          <QRPanel title="Carton QR Code" qrCode={product.cartonQrCode} productId={product._id} type="carton" />
          <div className="card bg-primary-50 border border-primary-100">
            <p className="text-xs text-primary-700 leading-relaxed font-body">
              <strong>Unit QR</strong> → individual packs for consumers.<br /><br />
              <strong>Carton QR</strong> → bulk packaging for retailers.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
