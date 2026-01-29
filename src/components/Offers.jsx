import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Edit2, Trash2, Save, X } from "lucide-react";

/* ================= AUTH (SAFE PARSE) ================= */
function safeParseJSON(v) {
  try {
    return JSON.parse(v || "null");
  } catch {
    return null;
  }
}

export default function OfferManagement() {
  const API_URL = process.env.REACT_APP_API_URL || "https://api.digicopy.in";

  const loggedUser = useMemo(
    () => safeParseJSON(localStorage.getItem("adminUser")),
    []
  );
 const role = String(loggedUser?.role || "").toUpperCase();
const isAdmin = role === "ADMIN" || role === "OWNER";

// ✅ staff access controlled by approved flag
const canManage = isAdmin || Number(loggedUser?.approved) === 1;

  const [products, setProducts] = useState([]);
  const [roles, setRoles] = useState([]);
  const [offers, setOffers] = useState([]);

  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [buyQuantity, setBuyQuantity] = useState("");
  const [freeQuantity, setFreeQuantity] = useState("");

  const [loading, setLoading] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  /* ================= HELPERS ================= */
  const getOfferId = (o) => o?.id ?? o?._id ?? o?.offer_id ?? null;
  const getProductId = (o) => Number(o?.product_id ?? o?.productId ?? 0) || null;
  const getRoleId = (o) => {
    const v = o?.role_id ?? o?.roleId;
    if (v === null || v === undefined || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };
  const getBuyQty = (o) => Number(o?.buy_quantity ?? o?.buyQuantity ?? 0) || 0;
  const getFreeQty = (o) =>
    Number(o?.free_quantity ?? o?.freeQuantity ?? 0) || 0;

  const productById = useMemo(() => {
    const m = new Map();
    products.forEach((p) => m.set(Number(p.id), p));
    return m;
  }, [products]);

  const roleById = useMemo(() => {
    const m = new Map();
    roles.forEach((r) => m.set(Number(r.id), r));
    return m;
  }, [roles]);

  /* ================= FETCH ================= */
  const fetchProducts = async () => {
    const res = await axios.get(`${API_URL}/api/products`);
    setProducts(Array.isArray(res.data) ? res.data : []);
  };

  const fetchRoles = async () => {
    const res = await axios.get(`${API_URL}/api/roles`);
    setRoles(Array.isArray(res.data) ? res.data : []);
  };

  const fetchOffers = async () => {
    const res = await axios.get(`${API_URL}/api/offers`);
    setOffers(Array.isArray(res.data) ? res.data : []);
  };

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setErrorMsg("");
        await Promise.all([fetchProducts(), fetchRoles(), fetchOffers()]);
      } catch (e) {
        if (alive) setErrorMsg(e?.message || "Failed to load data");
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ================= FORM ================= */
  const resetForm = () => {
    setSelectedProduct("");
    setSelectedRole("");
    setBuyQuantity("");
    setFreeQuantity("");
    setEditingOfferId(null);
  };

  const handleSaveOffer = async () => {
   if (!canManage) return;


    if (!selectedProduct || !buyQuantity || !freeQuantity) {
      alert("Please fill all fields");
      return;
    }

    const payload = {
      product_id: Number(selectedProduct),
      buy_quantity: Number(buyQuantity),
      free_quantity: Number(freeQuantity),
      role_id: selectedRole ? Number(selectedRole) : null,
    };

    try {
      setLoading(true);
      setErrorMsg("");

      if (editingOfferId) {
        await axios.put(`${API_URL}/api/offers/${editingOfferId}`, payload);
        alert("Offer updated");
      } else {
        await axios.post(`${API_URL}/api/offers`, payload);
        alert("Offer created");
      }

      resetForm();
      await fetchOffers();
    } catch (e) {
      setErrorMsg(e?.response?.data?.message || e?.message || "Failed to save offer");
      alert("Failed to save offer");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (offer) => {
   if (!canManage) return;


    setSelectedProduct(String(getProductId(offer) || ""));
    setSelectedRole(getRoleId(offer) ? String(getRoleId(offer)) : "");
    setBuyQuantity(String(getBuyQty(offer)));
    setFreeQuantity(String(getFreeQty(offer)));
    setEditingOfferId(getOfferId(offer));
  };

  const handleDelete = async (id) => {
   if (!canManage) return;

    if (!window.confirm("Delete this offer?")) return;

    try {
      setLoading(true);
      await axios.delete(`${API_URL}/api/offers/${id}`);
      await fetchOffers();
    } catch (e) {
      alert(e?.response?.data?.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI HELPERS ================= */
  const OfferCard = ({ o }) => {
    const id = getOfferId(o);
    const pid = getProductId(o);
    const rid = getRoleId(o);

    const productName = productById.get(pid)?.name || "—";
    const roleName = rid ? roleById.get(rid)?.role_name || "—" : "All Roles";

    return (
      <div className="p-4 border-b">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-bold truncate">{productName}</div>
            <div className="text-sm text-gray-500 truncate">{roleName}</div>
          </div>

          {isAdmin ? (
            <div className="shrink-0 flex gap-2">
              <button
                onClick={() => handleEdit(o)}
                className="p-2 rounded-lg bg-blue-100 text-blue-700"
                title="Edit"
                disabled={loading}
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete(id)}
                className="p-2 rounded-lg bg-red-100 text-red-700"
                title="Delete"
                disabled={loading}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ) : null}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="bg-gray-50 border rounded-lg p-2 text-center">
            <div className="text-[11px] text-gray-500">Buy</div>
            <div className="font-bold">{getBuyQty(o)}</div>
          </div>
          <div className="bg-gray-50 border rounded-lg p-2 text-center">
            <div className="text-[11px] text-gray-500">Free</div>
            <div className="font-bold">{getFreeQty(o)}</div>
          </div>
        </div>

        {!isAdmin ? (
          <div className="mt-3 text-xs text-gray-400">View only</div>
        ) : null}
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-indigo-700">
          Offer Management
        </h2>
        {loading ? (
          <span className="text-xs text-gray-500">Working...</span>
        ) : null}
      </div>

      {errorMsg ? (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
          {errorMsg}
        </div>
      ) : null}

      {/* 🔐 ADMIN ONLY FORM */}
      {isAdmin && (
        <div className="bg-white border rounded-xl p-4 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-3">
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Product
              </label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="border p-2 rounded-lg w-full"
                disabled={loading}
              >
                <option value="">Select Product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="border p-2 rounded-lg w-full"
                disabled={loading}
              >
                <option value="">All Roles</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.role_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Buy Qty
              </label>
              <input
                type="number"
                min="1"
                inputMode="numeric"
                placeholder="Buy Qty"
                value={buyQuantity}
                onChange={(e) => setBuyQuantity(e.target.value)}
                className="border p-2 rounded-lg w-full"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Free Qty
              </label>
              <input
                type="number"
                min="1"
                inputMode="numeric"
                placeholder="Free Qty"
                value={freeQuantity}
                onChange={(e) => setFreeQuantity(e.target.value)}
                className="border p-2 rounded-lg w-full"
                disabled={loading}
              />
            </div>
          </div>

          <div className="mt-3 flex flex-col sm:flex-row gap-2 sm:justify-end">
            <button
              onClick={handleSaveOffer}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60"
              disabled={loading}
            >
              <Save size={16} />
              {editingOfferId ? "Update Offer" : "Save Offer"}
            </button>

            {editingOfferId && (
              <button
                onClick={resetForm}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold inline-flex items-center justify-center gap-2"
                disabled={loading}
              >
                <X size={16} /> Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {/* DESKTOP TABLE */}
      <div className="hidden lg:block bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Product</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Buy</th>
              <th className="p-3 text-left">Free</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {offers.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  No offers found
                </td>
              </tr>
            ) : (
              offers.map((o) => {
                const pid = getProductId(o);
                const rid = getRoleId(o);

                return (
                  <tr key={getOfferId(o)} className="border-t">
                    <td className="p-3">{productById.get(pid)?.name || "—"}</td>
                    <td className="p-3">
                      {rid ? roleById.get(rid)?.role_name || "—" : "All"}
                    </td>
                    <td className="p-3">{getBuyQty(o)}</td>
                    <td className="p-3">{getFreeQty(o)}</td>

                    <td className="p-3">
                      {isAdmin ? (
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleEdit(o)}
                            className="text-blue-600 flex items-center gap-1"
                            disabled={loading}
                          >
                            <Edit2 size={16} /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(getOfferId(o))}
                            className="text-red-600 flex items-center gap-1"
                            disabled={loading}
                          >
                            <Trash2 size={16} /> Delete
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">View only</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARDS */}
      <div className="lg:hidden bg-white border rounded-xl overflow-hidden">
        {offers.length === 0 ? (
          <div className="p-6 text-center text-gray-500 text-sm">No offers found</div>
        ) : (
          offers.map((o) => <OfferCard key={getOfferId(o)} o={o} />)
        )}
      </div>
    </div>
  );
}
