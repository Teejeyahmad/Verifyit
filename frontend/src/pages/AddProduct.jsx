import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, ArrowLeft, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { Layout, PageHeader, FormGroup } from '../components/UI';

const CATEGORIES = ['drug', 'food', 'cosmetic', 'supplement', 'other'];

export default function AddProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [form, setForm] = useState({
    name: '', description: '', category: 'other',
    batch: '', expiryDate: '', nafdacNumber: '', ndleaNumber: '',
    images: [],
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleImages = e => {
    const files = Array.from(e.target.files);
    if (files.length + form.images.length > 5) return toast.error('Max 5 images');
    setImagePreviews(p => [...p, ...files.map(f => URL.createObjectURL(f))]);
    setForm(p => ({ ...p, images: [...p.images, ...files] }));
  };

  const removeImage = i => {
    setImagePreviews(p => p.filter((_, idx) => idx !== i));
    setForm(p => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }));
  };

  const onSubmit = async e => {
    e.preventDefault();
    if (!form.name) return toast.error('Product name is required');
    setLoading(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === 'images') v.forEach(f => fd.append('images', f));
      else if (v) fd.append(k, v);
    });
    try {
      const res = await api.post('/products', fd);
      toast.success('Product created with QR codes!');
      navigate(`/products/${res.data.product._id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create product');
    } finally { setLoading(false); }
  };

  return (
    <Layout>
      <PageHeader
        title="Add Product"
        subtitle="Register a product to generate authentication QR codes"
        action={
          <button onClick={() => navigate('/products')} className="btn-secondary text-xs sm:text-sm px-3 sm:px-5">
            <ArrowLeft size={15} /> Back
          </button>
        }
      />

      <form onSubmit={onSubmit}>
        {/* Stack on mobile, side-by-side on desktop */}
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-5">

          {/* ── Main details (full width on mobile, 2/3 on desktop) ── */}
          <div className="lg:col-span-2 space-y-4 lg:space-y-5">
            <div className="card space-y-4">
              <h2 className="font-display font-700 text-gray-800">Product Details</h2>

              <FormGroup label="Product Name *">
                <input className="input" placeholder="e.g. Paracetamol 500mg"
                  value={form.name} onChange={e => set('name', e.target.value)} />
              </FormGroup>

              <FormGroup label="Description">
                <textarea className="input resize-none" rows={3}
                  placeholder="Brief description of the product..."
                  value={form.description} onChange={e => set('description', e.target.value)} />
              </FormGroup>

              <div className="grid grid-cols-2 gap-4">
                <FormGroup label="Category">
                  <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                </FormGroup>
                <FormGroup label="Batch Number">
                  <input className="input" placeholder="BATCH-2025-001"
                    value={form.batch} onChange={e => set('batch', e.target.value)} />
                </FormGroup>
              </div>

              <FormGroup label="Expiry Date">
                <input className="input" type="date" value={form.expiryDate}
                  onChange={e => set('expiryDate', e.target.value)} />
              </FormGroup>
            </div>

            <div className="card space-y-4">
              <h2 className="font-display font-700 text-gray-800">Regulatory Numbers</h2>
              <div className="grid grid-cols-2 gap-4">
                <FormGroup label="NAFDAC Number">
                  <input className="input" placeholder="A1-1234"
                    value={form.nafdacNumber} onChange={e => set('nafdacNumber', e.target.value)} />
                </FormGroup>
                <FormGroup label="NDLEA Number">
                  <input className="input" placeholder="Optional"
                    value={form.ndleaNumber} onChange={e => set('ndleaNumber', e.target.value)} />
                </FormGroup>
              </div>
            </div>
          </div>

          {/* ── Right column (images + submit) ── */}
          <div className="lg:col-span-1 space-y-4">
            <div className="card">
              <h2 className="font-display font-700 text-gray-800 mb-3">Product Images</h2>
              <p className="text-xs text-gray-400 mb-4">Up to 5 images. Shown on the verification page.</p>

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-2 gap-2 mb-4">
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="relative group aspect-square">
                      <img src={src} alt="" className="w-full h-full object-cover rounded-xl" />
                      <button type="button" onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <X size={11} className="text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {imagePreviews.length < 5 && (
                <label className="flex flex-col items-center gap-2 border-2 border-dashed border-gray-200 rounded-xl py-6 cursor-pointer hover:border-primary-300 hover:bg-primary-50/30 transition-all">
                  <Upload size={22} className="text-gray-400" />
                  <span className="text-xs text-gray-400 text-center font-body">
                    Tap to upload<br />(JPEG, PNG · max 5MB)
                  </span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleImages} />
                </label>
              )}
            </div>

            <div className="card bg-primary-50 border border-primary-100">
              <div className="flex items-center gap-2.5 mb-2">
                <Package size={16} className="text-primary-600" />
                <p className="text-sm font-display font-700 text-gray-800">QR Codes</p>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                A <strong>Unit QR</strong> and a <strong>Carton QR</strong> will be generated automatically after saving.
              </p>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading
                ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full spin" />
                : 'Create Product & Generate QR'
              }
            </button>
          </div>
        </div>
      </form>
    </Layout>
  );
}
