import { useEffect, useState } from "react";
import axios from "axios";
import { Edit, Trash2, CheckCircle } from "lucide-react";

export default function Promotions() {
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  /* ===== AUTH ===== */
  const loggedUser = JSON.parse(localStorage.getItem("adminUser") || "null");

  const isAdmin = loggedUser?.role === "ADMIN";

  /* ===== STATE ===== */
  const [list, setList] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [active, setActive] = useState(true);

  const [loading, setLoading] = useState(false);

  const fetchPromotions = async () => {
    const res = await axios.get(`${API_URL}/api/promotions`);
    setList(Array.isArray(res.data) ? res.data : []);
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setMessage("");
    setActive(true);
  };

  const save = async () => {
    if (!isAdmin) return;
    if (!message.trim()) return alert("Promotion message is required");

    setLoading(true);
    try {
      if (editingId) {
        await axios.put(`${API_URL}/api/promotions/${editingId}`, {
          title,
          message,
          active: active ? 1 : 0,
        });
        alert("Promotion updated");
      } else {
        await axios.post(`${API_URL}/api/promotions`, {
          title,
          message,
          active: active ? 1 : 0,
        });
        alert("Promotion created");
      }
      resetForm();
      await fetchPromotions();
    } catch (e) {
      console.error(e);
      alert("Failed to save promotion");
    } finally {
      setLoading(false);
    }
  };

  const edit = (p) => {
    if (!isAdmin) return;
    setEditingId(p.id);
    setTitle(p.title || "");
    setMessage(p.message || "");
    setActive(!!p.active);
  };

  const activate = async (id) => {
    if (!isAdmin) return;
    try {
      await axios.put(`${API_URL}/api/promotions/${id}/activate`);
      await fetchPromotions();
    } catch (e) {
      console.error(e);
      alert("Failed to activate");
    }
  };

  const del = async (id) => {
    if (!isAdmin) return;
    if (!window.confirm("Delete this promotion?")) return;
    try {
      await axios.delete(`${API_URL}/api/promotions/${id}`);
      await fetchPromotions();
    } catch (e) {
      console.error(e);
      alert("Failed to delete");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-indigo-700">Promotions</h2>

      {/* ===== FORM (ADMIN ONLY) ===== */}
      {isAdmin && (
        <div className="bg-white border rounded-xl p-4 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <input
              className="border p-2 rounded"
              placeholder="Title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <label className="flex items-center gap-2 border p-2 rounded">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />
              Set as ACTIVE promotion
            </label>

            <button
              onClick={save}
              disabled={loading}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading
                ? "Saving..."
                : editingId
                ? "Update Promotion"
                : "Create Promotion"}
            </button>
          </div>

          <textarea
            className="border p-2 rounded w-full mt-3"
            rows={4}
            placeholder="Promotion message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          {editingId && (
            <button
              onClick={resetForm}
              className="mt-3 bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Cancel Edit
            </button>
          )}
        </div>
      )}

      {/* ===== LIST ===== */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Active</th>
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Message</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-500">
                  No promotions found
                </td>
              </tr>
            ) : (
              list.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-3">
                    {p.active ? (
                      <span className="inline-flex items-center gap-1 text-green-700 font-semibold">
                        <CheckCircle size={16} /> Active
                      </span>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </td>

                  <td className="p-3">{p.title || "—"}</td>
                  <td className="p-3 max-w-[600px] truncate">{p.message}</td>

                  <td className="p-3 flex gap-3">
                    {isAdmin ? (
                      <>
                        <button
                          onClick={() => edit(p)}
                          className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                        >
                          <Edit size={16} /> Edit
                        </button>

                        {!p.active && (
                          <button
                            onClick={() => activate(p.id)}
                            className="inline-flex items-center gap-1 text-green-700 hover:underline"
                          >
                            <CheckCircle size={16} /> Activate
                          </button>
                        )}

                        <button
                          onClick={() => del(p.id)}
                          className="inline-flex items-center gap-1 text-red-600 hover:underline"
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-400 text-xs">View only</span>
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
