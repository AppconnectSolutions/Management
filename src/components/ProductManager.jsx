import { useState, useEffect } from "react";
import { Package, Plus, X, Save, Edit2, Trash2 } from "lucide-react";

export default function ProductManager() {
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  /* ================= AUTH ================= */
  const loggedUser = JSON.parse(localStorage.getItem("admin") || "null");
  const isAdmin =
    loggedUser?.role === "ADMIN" || loggedUser?.role === "OWNER";

  /* ================= STATE ================= */
  const [products, setProducts] = useState([]);
  const [isAdding, setIsAdding] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: 0,
    category: "general",
  });

  const [editingId, setEditingId] = useState(null);
  const [editProduct, setEditProduct] = useState({
    name: "",
    price: 0,
    category: "general",
  });

  /* ================= LOAD PRODUCTS ================= */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products?t=${Date.now()}`);
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };

    fetchProducts();
  }, [API_URL]);

  /* ================= ADD PRODUCT (ADMIN ONLY) ================= */
  const handleSaveNew = async () => {
    try {
      const res = await fetch(`${API_URL}/api/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add product");

      setProducts((prev) => [...prev, data.product]);
      setNewProduct({ name: "", price: 0, category: "general" });
      setIsAdding(false);
    } catch (err) {
      alert(err.message);
    }
  };

  /* ================= EDIT PRODUCT (ADMIN ONLY) ================= */
  const startEdit = (p) => {
    setEditingId(p.id);
    setEditProduct({ ...p });
  };

  const saveEdit = async () => {
    try {
      const res = await fetch(`${API_URL}/api/products/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editProduct),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      setProducts((prev) =>
        prev.map((p) => (p.id === editingId ? data.product : p))
      );
      setEditingId(null);
    } catch (err) {
      alert(err.message);
    }
  };

  /* ================= DELETE PRODUCT (ADMIN ONLY) ================= */
  const onDeleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      const res = await fetch(`${API_URL}/api/products/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");

      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* HEADER */}
      <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Package className="text-indigo-600" size={20} />
          <h3 className="font-bold">Product & Price Manager</h3>
        </div>

        {/* ADD BUTTON (ADMIN ONLY) */}
        {isAdmin && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold"
          >
            <Plus size={16} /> Add New Item
          </button>
        )}
      </div>

      {/* ADD PRODUCT FORM (ADMIN ONLY) */}
      {isAdmin && isAdding && (
        <div className="p-4 bg-indigo-50 border-b grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            className="border px-3 py-2 rounded"
            placeholder="Item Name"
            value={newProduct.name}
            onChange={(e) =>
              setNewProduct({ ...newProduct, name: e.target.value })
            }
          />
          <input
            type="number"
            className="border px-3 py-2 rounded"
            placeholder="Price"
            value={newProduct.price}
            onChange={(e) =>
              setNewProduct({ ...newProduct, price: Number(e.target.value) })
            }
          />
          <select
            className="border px-3 py-2 rounded"
            value={newProduct.category}
            onChange={(e) =>
              setNewProduct({ ...newProduct, category: e.target.value })
            }
          >
            <option value="general">General</option>
            <option value="service">Service</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={handleSaveNew}
              className="flex-1 bg-green-600 text-white rounded font-bold"
            >
              Save
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="px-3 border rounded"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* PRODUCTS TABLE */}
      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3">Item</th>
            <th className="px-6 py-3">Category</th>
            <th className="px-6 py-3">Price</th>
            <th className="px-6 py-3 text-right">
              {isAdmin ? "Actions" : ""}
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-t">
              <td className="px-6 py-3 font-bold">
                {editingId === p.id ? (
                  <input
                    className="border px-2 py-1 rounded"
                    value={editProduct.name}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        name: e.target.value,
                      })
                    }
                  />
                ) : (
                  p.name
                )}
              </td>

              <td className="px-6 py-3">{p.category}</td>

              <td className="px-6 py-3">
                {editingId === p.id ? (
                  <input
                    type="number"
                    className="border px-2 py-1 rounded w-24"
                    value={editProduct.price}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        price: Number(e.target.value),
                      })
                    }
                  />
                ) : (
                  `₹${p.price}`
                )}
              </td>

              {/* ACTIONS (ADMIN ONLY) */}
              <td className="px-6 py-3 text-right">
                {isAdmin &&
                  (editingId === p.id ? (
                    <>
                      <button
                        onClick={saveEdit}
                        className="mr-2 text-green-600"
                      >
                        <Save size={16} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-gray-500"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(p)}
                        className="mr-3 text-indigo-600"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => onDeleteProduct(p.id)}
                        className="text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
