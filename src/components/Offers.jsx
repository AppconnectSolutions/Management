import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Edit, Trash2 } from "lucide-react";

/* ================= AUTH ================= */
const loggedUser = JSON.parse(localStorage.getItem("admin") || "null");
const isAdmin = loggedUser?.role === "ADMIN";

export default function OfferManagement() {
  const API_URL = process.env.REACT_APP_API_URL || "https://api.digicopy.in";

  const [products, setProducts] = useState([]);
  const [roles, setRoles] = useState([]);
  const [offers, setOffers] = useState([]);

  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [buyQuantity, setBuyQuantity] = useState("");
  const [freeQuantity, setFreeQuantity] = useState("");

  const [loading, setLoading] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState(null);

  /* ================= HELPERS ================= */
  const getProductId = (o) => o?.product_id ?? o?.productId ?? null;
  const getRoleId = (o) => o?.role_id ?? o?.roleId ?? null;
  const getBuyQty = (o) => o?.buy_quantity ?? o?.buyQuantity ?? 0;
  const getFreeQty = (o) => o?.free_quantity ?? o?.freeQuantity ?? 0;

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
    fetchProducts();
    fetchRoles();
    fetchOffers();
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
    if (!isAdmin) return;

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

      if (editingOfferId) {
        await axios.put(`${API_URL}/api/offers/${editingOfferId}`, payload);
        alert("Offer updated");
      } else {
        await axios.post(`${API_URL}/api/offers`, payload);
        alert("Offer created");
      }

      resetForm();
      fetchOffers();
    } catch {
      alert("Failed to save offer");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (offer) => {
    if (!isAdmin) return;

    setSelectedProduct(String(getProductId(offer)));
    setSelectedRole(getRoleId(offer) ? String(getRoleId(offer)) : "");
    setBuyQuantity(String(getBuyQty(offer)));
    setFreeQuantity(String(getFreeQty(offer)));
    setEditingOfferId(offer.id);
  };

  const handleDelete = async (id) => {
    if (!isAdmin) return;
    if (!window.confirm("Delete this offer?")) return;

    await axios.delete(`${API_URL}/api/offers/${id}`);
    fetchOffers();
  };

  /* ================= UI ================= */
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-indigo-700">
        Offer Management
      </h2>

      {/* 🔐 ADMIN ONLY FORM */}
      {isAdmin && (
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="border p-2 rounded w-full lg:w-64"
          >
            <option value="">Select Product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="border p-2 rounded w-full lg:w-64"
          >
            <option value="">All Roles</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.role_name}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Buy Qty"
            value={buyQuantity}
            onChange={(e) => setBuyQuantity(e.target.value)}
            className="border p-2 rounded w-32"
          />

          <input
            type="number"
            placeholder="Free Qty"
            value={freeQuantity}
            onChange={(e) => setFreeQuantity(e.target.value)}
            className="border p-2 rounded w-32"
          />

          <button
            onClick={handleSaveOffer}
            className="bg-indigo-600 text-white px-4 py-2 rounded"
          >
            {editingOfferId ? "Update Offer" : "Save Offer"}
          </button>

          {editingOfferId && (
            <button
              onClick={resetForm}
              className="bg-gray-400 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          )}
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full">
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
              offers.map((o) => (
                <tr key={o.id} className="border-t">
                  <td className="p-3">
                    {productById.get(getProductId(o))?.name || "—"}
                  </td>
                  <td className="p-3">
                    {getRoleId(o)
                      ? roleById.get(getRoleId(o))?.role_name
                      : "All"}
                  </td>
                  <td className="p-3">{getBuyQty(o)}</td>
                  <td className="p-3">{getFreeQty(o)}</td>

                  <td className="p-3">
                    {isAdmin ? (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleEdit(o)}
                          className="text-blue-600 flex items-center gap-1"
                        >
                          <Edit size={16} /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(o.id)}
                          className="text-red-600 flex items-center gap-1"
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">
                        View only
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
