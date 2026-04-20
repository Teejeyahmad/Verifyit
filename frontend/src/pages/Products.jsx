import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Package,
  Plus,
  QrCode,
  Trash2,
  Search,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { Layout, PageHeader, EmptyState, Loader } from "../components/UI";

const categoryColor = {
  drug: "tag-red",
  food: "tag-green",
  cosmetic: "tag-blue",
  supplement: "tag-amber",
  other: "tag-gray",
};

export default function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    api
      .get("/products")
      .then((r) => setProducts(r.data.products ? r.data.products : []))
      .catch(() => toast.error("Failed to load products"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm("Delete this product? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted");
      setProducts((p) => p.filter((x) => x._id !== id));
    } catch {
      toast.error("Failed to delete product");
    } finally {
      setDeleting(null);
    }
  };

  const filtered = products?.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase()) ||
      p.batch?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Layout>
      <PageHeader
        title="Products"
        subtitle={`${products?.length} product${products?.length && products?.length !== 1 ? "s" : ""} registered`}
        action={
          products.length ? (
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
        <Loader text="Loading products..." />
      ) : (
        <>
          {products?.length > 0 && (
            <div className="relative mb-4">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                className="input pl-10"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}

          {filtered?.length === 0 && products?.length > 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-400 text-sm">No results for "{search}"</p>
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No products yet"
              subtitle="Register your first product to generate QR codes"
              action={
                <Link to="/products/add" className="btn-primary">
                  <Plus size={16} /> Add Product
                </Link>
              }
            />
          ) : (
            <>
              {/* ── Desktop table (hidden on mobile) ── */}
              <div className="card p-0 overflow-hidden hidden md:block">
                <div className="grid grid-cols-12 gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <div className="col-span-4">Product</div>
                  <div className="col-span-2">Category</div>
                  <div className="col-span-2">Batch</div>
                  <div className="col-span-1 text-center">Scans</div>
                  <div className="col-span-2 text-center">QR</div>
                  <div className="col-span-1" />
                </div>
                {filtered?.map((p, i) => (
                  <div
                    key={p._id}
                    onClick={() => navigate(`/products/${p._id}`)}
                    className={`grid grid-cols-12 gap-3 px-5 py-4 items-center cursor-pointer hover:bg-primary-50/40 transition-colors group
                      ${i < filtered?.length - 1 ? "border-b border-gray-100" : ""}`}
                  >
                    <div className="col-span-4 flex items-center gap-3">
                      {p.images?.[0] ? (
                        <img
                          src={p.images[0]}
                          alt=""
                          className="w-9 h-9 rounded-xl object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                          <Package size={16} className="text-primary-400" />
                        </div>
                      )}
                      <span className="text-sm font-semibold text-gray-900 group-hover:text-primary-700 transition-colors truncate">
                        {p.name}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className={categoryColor[p.category] || "tag-gray"}>
                        {p.category || "—"}
                      </span>
                    </div>
                    <div className="col-span-2 text-sm text-gray-500 truncate">
                      {p.batch || "—"}
                    </div>
                    <div className="col-span-1 text-center text-sm font-semibold text-gray-700">
                      {p.scanCount || 0}
                    </div>
                    <div className="col-span-2 flex justify-center">
                      {p.unitQrCode ? (
                        <span className="tag-green">
                          <QrCode size={11} /> Ready
                        </span>
                      ) : (
                        <span className="tag-amber">Pending</span>
                      )}
                    </div>
                    <div className="col-span-1 flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => handleDelete(p._id, e)}
                        disabled={deleting === p._id}
                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                      <ArrowRight
                        size={14}
                        className="text-gray-300 group-hover:text-primary-500 transition-colors"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Mobile card list (hidden on desktop) ── */}
              <div className="space-y-3 md:hidden">
                {filtered.map((p) => (
                  <div
                    key={p._id}
                    onClick={() => navigate(`/products/${p._id}`)}
                    className="card p-4 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform"
                  >
                    {p.images?.[0] ? (
                      <img
                        src={p.images[0]}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                        <Package size={20} className="text-primary-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate text-sm">
                        {p.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 capitalize">
                        {p.category} · {p.batch || "No batch"}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        {p.unitQrCode ? (
                          <span className="tag-green">
                            <QrCode size={10} /> QR Ready
                          </span>
                        ) : (
                          <span className="tag-amber">Pending</span>
                        )}
                        <span className="text-xs text-gray-400">
                          {p.scanCount || 0} scans
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => handleDelete(p._id, e)}
                        disabled={deleting === p._id}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={15} />
                      </button>
                      <ArrowRight size={15} className="text-gray-300" />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </Layout>
  );
}
