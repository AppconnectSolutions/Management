import { useEffect, useMemo, useState } from "react";
import { Package, Plus, X, Save, Edit2, Trash2 } from "lucide-react";

export default function ProductManager() {
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  /* ================= AUTH ================= */
  const loggedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("adminUser") || "null");
    } catch {
      return null;
    }
  }, []);

  const role = String(loggedUser?.role || "").toUpperCase();
  const isAdmin = role === "ADMIN" || role === "OWNER";

  /* ================= STATE ================= */
  const [products, setProducts] = useState([]);
  const [isAdding, setIsAdding] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    category: "general",
  });

  const [editingId, setEditingId] = useState(null);
  const [editProduct, setEditProduct] = useState({
    name: "",
    price: "",
    category: "general",
  });

  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  /* ================= HELPERS ================= */
  const formatINR = (val) => {
    const n = Number(val);
    if (!Number.isFinite(n)) return `₹${val ?? ""}`;
    return `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(
      n
    )}`;
  };

  const normalizeProducts = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.products)) return data.products;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  };

  const normalizeOneProduct = (data) => {
    if (data?.product) return data.product;
    if (data?.data) return data.data;
    return data;
  };

  const getId = (p) => p?.id ?? p?._id ?? p?.product_id ?? p?.productId;

  const resetAddForm = () => {
    setIsAdding(false);
    setNewProduct({ name: "", price: "", category: "general" });
  };

  /* ================= LOAD PRODUCTS ================= */
  useEffect(() => {
    let alive = true;

    const fetchProducts = async () => {
      setLoading(true);
      setErrMsg("");
      try {
        const res = await fetch(`${API_URL}/api/products`);
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data?.message || "Failed to load products");
        }

        const list = normalizeProducts(data)
          .map((p) => ({
            ...p,
            id: getId(p),
            category: p?.category || "general",
          }))
          .filter((p) => p.id !== undefined && p.id !== null);

        if (alive) setProducts(list);
      } catch (err) {
        if (alive) setErrMsg(err?.message || "Fetch products error");
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchProducts();
    return () => {
      alive = false;
    };
  }, [API_URL]);

  /* ================= ADD ================= */
  const handleSaveNew = async () => {
    const name = String(newProduct.name || "").trim();
    const price = String(newProduct.price || "").trim();
    const category = newProduct.category || "general";

    if (!name || !price) return;

    try {
      const payload = {
        name,
        category,
        price: Number.isFinite(Number(price)) ? Number(price) : price,
      };

      const res = await fetch(`${API_URL}/api/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Create failed");

      const created = normalizeOneProduct(data);
      const createdId = getId(created);

      setProducts((prev) => [
        ...prev,
        {
          ...created,
          id: createdId ?? created?.id,
          category: created?.category || category,
        },
      ]);

      resetAddForm();
    } catch (err) {
      alert(err?.message || "Add failed");
    }
  };

  /* ================= EDIT ================= */
  const startEdit = (p) => {
    const id = getId(p);
    setEditingId(id);
    setEditProduct({
      name: p?.name ?? "",
      price: p?.price ?? "",
      category: p?.category ?? "general",
    });
    setIsAdding(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditProduct({ name: "", price: "", category: "general" });
  };

  const saveEdit = async () => {
    if (editingId === null || editingId === undefined) return;

    const name = String(editProduct.name || "").trim();
    const price = String(editProduct.price || "").trim();
    const category = editProduct.category || "general";

    if (!name || !price) return;

    try {
      const payload = {
        name,
        category,
        price: Number.isFinite(Number(price)) ? Number(price) : price,
      };

      const res = await fetch(`${API_URL}/api/products/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Update failed");

      const updated = normalizeOneProduct(data);

      setProducts((prev) =>
        prev.map((x) =>
          getId(x) === editingId
            ? { ...x, ...updated, id: getId(updated) ?? editingId }
            : x
        )
      );

      cancelEdit();
    } catch (err) {
      alert(err?.message || "Edit failed");
    }
  };

  /* ================= DELETE ================= */
  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this item?")) return;

    try {
      const res = await fetch(`${API_URL}/api/products/${id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Delete failed");

      setProducts((p) => p.filter((x) => getId(x) !== id));
      if (editingId === id) cancelEdit();
    } catch (err) {
      alert(err?.message || "Delete failed");
    }
  };

  /* ================= UI BITS ================= */
  const CategoryBadge = ({ value }) => {
    const v = String(value || "general").toLowerCase();
    const isService = v === "service";
    return (
      <span
        className={[
          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
          isService
            ? "bg-amber-100 text-amber-800"
            : "bg-slate-100 text-slate-700",
        ].join(" ")}
      >
        {isService ? "Service" : "General"}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow border overflow-hidden w-full">
      {/* HEADER */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Package size={20} className="text-indigo-600" />
            <div>
              <h3 className="font-bold leading-tight">Product & Price Manager</h3>
              <p className="text-xs text-gray-500">
                {loading ? "Loading..." : `${products.length} items`}
              </p>
            </div>
          </div>

          {isAdmin && (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  cancelEdit();
                  setIsAdding((x) => !x);
                }}
                className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold w-full sm:w-auto"
              >
                <Plus size={16} /> {isAdding ? "Close" : "Add"}
              </button>
            </div>
          )}
        </div>

        {errMsg ? (
          <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
            {errMsg}
          </div>
        ) : null}
      </div>

      {/* ADD FORM */}
      {isAdmin && isAdding && (
        <div className="p-4 bg-indigo-50 border-b">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Item name
              </label>
              <input
                className="w-full border px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Eg: Xerox A4"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Price
              </label>
              <input
                type="number"
                inputMode="decimal"
                className="w-full border px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Eg: 10"
                value={newProduct.price}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, price: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Category
              </label>
              <select
                className="w-full border px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-200"
                value={newProduct.category}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, category: e.target.value })
                }
              >
                <option value="general">General</option>
                <option value="service">Service</option>
              </select>
            </div>
          </div>

          <div className="mt-3 flex flex-col sm:flex-row gap-2 sm:justify-end">
            <button
              onClick={handleSaveNew}
              className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-bold w-full sm:w-auto"
            >
              <Save size={16} /> Save
            </button>
            <button
              onClick={resetAddForm}
              className="inline-flex items-center justify-center gap-2 border bg-white px-4 py-2 rounded-lg font-bold w-full sm:w-auto"
            >
              <X size={16} /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && products.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          No products found.
          {isAdmin ? " Click Add to create your first item." : ""}
        </div>
      ) : null}

      {/* DESKTOP TABLE (md and up) */}
      <div className="hidden md:block">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left">Item</th>
              <th className="px-6 py-3 text-left">Category</th>
              <th className="px-6 py-3 text-left">Price</th>
              <th className="px-6 py-3 text-right">{isAdmin ? "Actions" : ""}</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p) => {
              const id = getId(p);
              const isEditing = editingId === id;

              return (
                <tr key={id} className="border-t">
                  <td className="px-6 py-3">
                    {isEditing ? (
                      <input
                        className="border px-3 py-2 rounded-lg w-full max-w-md"
                        value={editProduct.name}
                        onChange={(e) =>
                          setEditProduct({ ...editProduct, name: e.target.value })
                        }
                      />
                    ) : (
                      <div className="font-bold">{p.name}</div>
                    )}
                  </td>

                  <td className="px-6 py-3">
                    {isEditing ? (
                      <select
                        className="border px-3 py-2 rounded-lg"
                        value={editProduct.category}
                        onChange={(e) =>
                          setEditProduct({
                            ...editProduct,
                            category: e.target.value,
                          })
                        }
                      >
                        <option value="general">General</option>
                        <option value="service">Service</option>
                      </select>
                    ) : (
                      <CategoryBadge value={p.category} />
                    )}
                  </td>

                  <td className="px-6 py-3">
                    {isEditing ? (
                      <input
                        type="number"
                        inputMode="decimal"
                        className="border px-3 py-2 rounded-lg w-32"
                        value={editProduct.price}
                        onChange={(e) =>
                          setEditProduct({
                            ...editProduct,
                            price: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <div className="font-semibold">{formatINR(p.price)}</div>
                    )}
                  </td>

                  <td className="px-6 py-3 text-right">
                    {isAdmin &&
                      (isEditing ? (
                        <div className="inline-flex items-center gap-3">
                          <button
                            onClick={saveEdit}
                            className="text-green-600 hover:opacity-80"
                            title="Save"
                          >
                            <Save size={18} />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-gray-500 hover:opacity-80"
                            title="Cancel"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-3">
                          <button
                            onClick={() => startEdit(p)}
                            className="text-indigo-600 hover:opacity-80"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => deleteProduct(id)}
                            className="text-red-500 hover:opacity-80"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MOBILE / SMALL SCREENS (below md) */}
      <div className="md:hidden divide-y">
        {products.map((p) => {
          const id = getId(p);
          const isEditing = editingId === id;

          return (
            <div key={id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  {isEditing ? (
                    <input
                      className="w-full border px-3 py-2 rounded-lg"
                      value={editProduct.name}
                      onChange={(e) =>
                        setEditProduct({ ...editProduct, name: e.target.value })
                      }
                    />
                  ) : (
                    <div className="font-bold truncate">{p.name}</div>
                  )}

                  <div className="mt-1">{!isEditing && <CategoryBadge value={p.category} />}</div>

                  {isEditing ? (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          Category
                        </label>
                        <select
                          className="w-full border px-3 py-2 rounded-lg"
                          value={editProduct.category}
                          onChange={(e) =>
                            setEditProduct({
                              ...editProduct,
                              category: e.target.value,
                            })
                          }
                        >
                          <option value="general">General</option>
                          <option value="service">Service</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          Price
                        </label>
                        <input
                          type="number"
                          inputMode="decimal"
                          className="w-full border px-3 py-2 rounded-lg"
                          value={editProduct.price}
                          onChange={(e) =>
                            setEditProduct({
                              ...editProduct,
                              price: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 font-semibold">{formatINR(p.price)}</div>
                  )}
                </div>

                {isAdmin && (
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {isEditing ? (
                      <>
                        <button
                          onClick={saveEdit}
                          className="inline-flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-bold"
                        >
                          <Save size={16} /> Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="inline-flex items-center gap-2 border bg-white px-3 py-2 rounded-lg text-sm font-bold"
                        >
                          <X size={16} /> Cancel
                        </button>
                      </>
                    ) : (
                      <div className="flex gap-3">
                        <button
                          onClick={() => startEdit(p)}
                          className="text-indigo-600"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => deleteProduct(id)}
                          className="text-red-500"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
