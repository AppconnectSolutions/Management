import { useEffect, useMemo, useRef, useState } from "react";
import { Users, MessageSquare, Upload, Megaphone, Save, X, Edit2, Trash2 } from "lucide-react";
import html2canvas from "html2canvas";
import Invoice from "./Invoice";
import { createRoot } from "react-dom/client";
import { useNavigate } from "react-router-dom";

const WA_TAB_NAME = "WHATSAPP_WEB_TAB";

function normalizePhone(mobile) {
  let digits = String(mobile || "").replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  if (digits.length === 10) digits = "91" + digits;
  return digits;
}

function buildWaUrl(phone, text) {
  const msg = encodeURIComponent(text || "");
  return `https://web.whatsapp.com/send?phone=${phone}&text=${msg}&app_absent=0`;
}

export default function CustomerList() {
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const navigate = useNavigate();
  const waWindowRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", mobile: "", usedPages: 0 });

  const [sendingInvoice, setSendingInvoice] = useState(false);
  const [sendingPromo, setSendingPromo] = useState(false);

  const [activePromo, setActivePromo] = useState({
    id: null,
    title: "",
    message: "🔥 Special Offer! Xerox & Services available. Visit today and get best deals!",
    is_active: 0,
  });

  const loggedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("adminUser") || "null");
    } catch {
      return null;
    }
  }, []);

  const role = String(loggedUser?.role || "").toUpperCase();
const isAdmin = role === "ADMIN" || role === "OWNER";

// ✅ staff access controlled by approved flag
const canManage = isAdmin || Number(loggedUser?.approved) === 1;


  /* ================= WhatsApp tab re-use ================= */
  const getOrOpenWhatsAppTab = () => {
    if (waWindowRef.current && !waWindowRef.current.closed) {
      waWindowRef.current.focus();
      return waWindowRef.current;
    }

    const win = window.open("about:blank", WA_TAB_NAME);
    if (!win) {
      alert("Popup blocked! Please allow popups for this site.");
      return null;
    }

    win.location.href = "https://web.whatsapp.com/";
    waWindowRef.current = win;
    win.focus();
    return win;
  };

  /* ================= Fetch active promo ================= */
  const fetchActivePromotion = async () => {
    try {
      const res = await fetch(`${API_URL}/api/promotions/active`);
      if (!res.ok) return null;

      const data = await res.json();
      if (!data?.message) return null;

      const promo = {
        id: data.id ?? null,
        title: data.title ?? "",
        message: String(data.message || ""),
        is_active: data.is_active ?? 1,
      };

      setActivePromo(promo);
      return promo;
    } catch (err) {
      console.log("Active promo fetch failed:", err?.message);
      return null;
    }
  };

  /* ================= Fetch rewards ================= */
  const fetchRewards = async (mobile) => {
    try {
      const res = await fetch(`${API_URL}/api/transactions/customer/${mobile}`);
      const data = await res.json();

      const xerox = data?.rewards?.xerox || {};
      const totalPrinted = Number(xerox.totalPrinted || 0);
      const paidTotal = Number(xerox.paid_total || 0);
      const freeRemaining = Number(xerox.free_remaining || 0);

      const freeUsed = Math.max(totalPrinted - paidTotal, 0);
      const freeEarned = freeRemaining + freeUsed;

      return { usedPages: totalPrinted, freeEarned, freeRemaining };
    } catch (err) {
      console.error("fetchRewards error:", err);
      return { usedPages: 0, freeEarned: 0, freeRemaining: 0 };
    }
  };

  /* ================= Fetch customers ================= */
  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/customers`);
      const data = await res.json();

      const enriched = await Promise.all(
        (data || []).map(async (c) => {
          const rewards = await fetchRewards(c.mobile);
          return { ...c, ...rewards };
        })
      );

      setCustomers(enriched);
    } catch (err) {
      console.error("fetchCustomers error:", err);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchActivePromotion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ================= CSV upload ================= */
  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const res = await fetch(`${API_URL}/api/customers/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      alert(data.message || "Upload successful");
      await fetchCustomers();
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  /* ================= Promote ================= */
  const promoteCustomer = async (customer) => {
    if (!customer?.mobile) return;

    const waWin = getOrOpenWhatsAppTab();
    if (!waWin) return;

    try {
      setSendingPromo(true);

      const latestPromo = (await fetchActivePromotion()) || activePromo;
      const phone = normalizePhone(customer.mobile);

      const promoMsg = latestPromo?.message?.trim()
        ? latestPromo.message.trim()
        : "🔥 Special Offer! Visit today and get best deals!";

      const titleLine = latestPromo?.title ? `*${latestPromo.title}*\n\n` : "";
      const text = `Hi ${customer.name || ""}\n\n${titleLine}${promoMsg}`;

      waWin.location.href = buildWaUrl(phone, text);
      waWin.focus();
    } catch (e) {
      console.error("promoteCustomer error:", e);
      alert(e.message || "Failed to send promotion");
    } finally {
      setSendingPromo(false);
    }
  };

  /* ================= Invoice notify ================= */
  const notifyCustomer = async (customer) => {
    if (!customer?.mobile) return;

    const waWin = getOrOpenWhatsAppTab();
    if (!waWin) return;

    const phone = normalizePhone(customer.mobile);
    waWin.location.href = buildWaUrl(phone, `Hi ${customer.name || ""}, preparing your invoice...`);
    waWin.focus();

    try {
      setSendingInvoice(true);

      const invoice = {
        billNo: customer.billNo || "N/A",
        date: new Date().toLocaleDateString(),
        items: customer.items || [],
        subTotal: customer.subTotal || 0,
        finalAmount: customer.finalAmount || 0,
        customerPrintCount: customer.usedPages || 0,
      };

      const container = document.createElement("div");
      container.style.position = "fixed";
      container.style.top = "-10000px";
      container.style.left = "-10000px";
      container.style.width = "380px";
      container.style.background = "white";
      document.body.appendChild(container);

      const root = createRoot(container);
      root.render(<Invoice data={invoice} />);

      await new Promise((resolve) => {
        const check = () => {
          if (container.innerText.trim().length > 0) resolve();
          else requestAnimationFrame(check);
        };
        check();
      });

      const canvas = await html2canvas(container, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });

      root.unmount();
      document.body.removeChild(container);

      const dataUrl = canvas.toDataURL("image/png");
      const blob = await (await fetch(dataUrl)).blob();
      if (!blob) throw new Error("Invoice image generation failed");

      const formData = new FormData();
      formData.append("file", blob, "invoice.png");

      const uploadRes = await fetch(`${API_URL}/api/invoices/upload`, {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();
      const url = uploadData?.url;
      if (!url) throw new Error("Upload failed (no URL returned)");

      const text = `Hi ${customer.name || ""}, your invoice is ready.\nView it here: ${url}`;
      waWin.location.href = buildWaUrl(phone, text);
      waWin.focus();
    } catch (e) {
      console.error("notifyCustomer error:", e);
      alert(e.message || "Failed to send invoice");
    } finally {
      setSendingInvoice(false);
    }
  };

  /* ================= Transactions ================= */
  const viewTransactions = (customer) => {
    navigate(`/admin/customers/${customer.mobile}/transactions`);
  };

  /* ================= Edit / delete ================= */
  const startEdit = (c) => {
   if (!canManage) return;


    setEditingId(c.id);
    setEditForm({
      name: c.name || "",
      mobile: c.mobile || "",
      usedPages: c.usedPages ?? 0,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: "", mobile: "", usedPages: 0 });
  };

  const saveEdit = async (customer) => {
   if (!canManage) return;

    try {
      await fetch(`${API_URL}/api/customers/${customer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          mobile: editForm.mobile,
        }),
      });

      await fetch(`${API_URL}/api/customers/${customer.id}/adjust-xerox`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalPrinted: Number(editForm.usedPages),
        }),
      });

      await fetchCustomers();
      cancelEdit();
    } catch (e) {
      alert(e?.message || "Update failed");
    }
  };

  const deleteCustomer = async (id) => {
    if (!canManage) return;
    if (!window.confirm("Deactivate this customer?")) return;

    try {
      await fetch(`${API_URL}/api/customers/${id}`, { method: "DELETE" });
      await fetchCustomers();
    } catch (e) {
      alert(e?.message || "Deactivate failed");
    }
  };

  /* ================= Filtered list ================= */
  const filtered = customers
    .filter((c) => c.is_active !== 0)
    .filter((c) => {
      const st = searchTerm.toLowerCase();
      return (c.name || "").toLowerCase().includes(st) || String(c.mobile || "").includes(searchTerm);
    });

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden w-full">
      {/* HEADER */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3">
          <div className="flex flex-col">
            <h3 className="font-bold flex items-center gap-2">
              <Users size={20} /> Customer Database
            </h3>

            <div className="text-xs text-gray-600 mt-1">
              <span className="font-semibold">Active Promo:</span>{" "}
              {activePromo?.title ? `${activePromo.title} - ` : ""}
              {activePromo?.message?.slice(0, 80) || "-"}
              {activePromo?.message?.length > 80 ? "..." : ""}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center w-full lg:w-auto">
            <label className="bg-indigo-600 text-white px-3 py-2 rounded cursor-pointer text-sm inline-flex items-center gap-2 w-fit">
              <Upload size={16} />
              {uploading ? "Uploading..." : "Upload CSV"}
              <input type="file" hidden accept=".csv" onChange={handleUpload} />
            </label>

            <input
              className="border px-3 py-2 rounded text-sm w-full sm:w-64"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden lg:block">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Mobile</th>
              <th className="px-6 py-3 text-center">Used Pages</th>
              <th className="px-6 py-3 text-center">Free Earned</th>
              <th className="px-6 py-3 text-center">Free Remaining</th>
              <th className="px-6 py-3 text-center">Promotions</th>
              <th className="px-6 py-3 text-right">Invoice</th>
              <th className="px-6 py-3 text-center">Transactions</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="px-6 py-3 font-bold">
                  {editingId === c.id ? (
                    <input
                      className="border px-2 py-1 rounded text-sm w-full"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    />
                  ) : (
                    c.name || "-"
                  )}
                </td>

                <td className="px-6 py-3">
                  {editingId === c.id ? (
                    <input
                      className="border px-2 py-1 rounded text-sm w-full"
                      value={editForm.mobile}
                      onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                    />
                  ) : (
                    c.mobile || "-"
                  )}
                </td>

                <td className="px-6 py-3 text-center">
                  {editingId === c.id ? (
                    <input
                      type="number"
                      min="0"
                      className="border px-2 py-1 rounded text-sm w-20 text-center"
                      value={editForm.usedPages}
                      onChange={(e) =>
                        setEditForm({ ...editForm, usedPages: Number(e.target.value || 0) })
                      }
                    />
                  ) : (
                    c.usedPages ?? 0
                  )}
                </td>

                <td className="px-6 py-3 text-center">{c.freeEarned ?? 0}</td>
                <td className="px-6 py-3 text-center">{c.freeRemaining ?? 0}</td>

                <td className="px-6 py-3 text-center">
                  <button
                    disabled={sendingPromo}
                    onClick={() => promoteCustomer(c)}
                    className="bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded text-xs inline-flex items-center gap-2 disabled:opacity-60"
                  >
                    <Megaphone size={14} />
                    {sendingPromo ? "Sending..." : "Promote"}
                  </button>
                </td>

                <td className="px-6 py-3 text-right">
                  <button
                    disabled={sendingInvoice}
                    onClick={() => notifyCustomer(c)}
                    className="bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded text-xs inline-flex items-center gap-2 disabled:opacity-60"
                  >
                    <MessageSquare size={14} />
                    {sendingInvoice ? "Sending..." : "Notify"}
                  </button>
                </td>

                <td className="px-6 py-3 text-center">
                  <button
                    onClick={() => viewTransactions(c)}
                    className="bg-green-100 text-green-700 px-3 py-1.5 rounded text-xs inline-flex items-center gap-2"
                  >
                    View
                  </button>
                </td>

                <td className="px-6 py-3 text-center">
                  {isAdmin ? (
                    editingId === c.id ? (
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => saveEdit(c)}
                          className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs inline-flex items-center gap-1"
                        >
                          <Save size={14} /> Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs inline-flex items-center gap-1"
                        >
                          <X size={14} /> Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => startEdit(c)}
                          className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs inline-flex items-center gap-1"
                        >
                          <Edit2 size={14} /> Update
                        </button>
                        <button
                          onClick={() => deleteCustomer(c.id)}
                          className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs inline-flex items-center gap-1"
                        >
                          <Trash2 size={14} /> Deactivate
                        </button>
                      </div>
                    )
                  ) : (
                    <span className="text-gray-400 text-xs">View only</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE / TABLET CARDS */}
      <div className="lg:hidden divide-y">
        {filtered.map((c) => {
          const isEditing = editingId === c.id;

          return (
            <div key={c.id} className="p-4">
              {/* Top row */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {isEditing ? (
                    <input
                      className="w-full border px-3 py-2 rounded-lg text-sm font-semibold"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="Name"
                    />
                  ) : (
                    <div className="font-bold text-base truncate">{c.name || "-"}</div>
                  )}

                  <div className="mt-1 text-sm text-gray-600">
                    {isEditing ? (
                      <input
                        className="w-full border px-3 py-2 rounded-lg text-sm"
                        value={editForm.mobile}
                        onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                        placeholder="Mobile"
                      />
                    ) : (
                      <span className="break-all">{c.mobile || "-"}</span>
                    )}
                  </div>
                </div>

                {/* Admin quick actions */}
                {isAdmin && !isEditing ? (
                  <div className="shrink-0 flex gap-2">
                    <button
                      onClick={() => startEdit(c)}
                      className="p-2 rounded-lg bg-orange-100 text-orange-700"
                      title="Update"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => deleteCustomer(c.id)}
                      className="p-2 rounded-lg bg-red-100 text-red-700"
                      title="Deactivate"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : null}
              </div>

              {/* Stats grid */}
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="bg-gray-50 border rounded-lg p-2 text-center">
                  <div className="text-[11px] text-gray-500">Used</div>
                  <div className="font-bold text-sm">
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        className="w-full border rounded px-2 py-1 text-center text-sm bg-white"
                        value={editForm.usedPages}
                        onChange={(e) =>
                          setEditForm({ ...editForm, usedPages: Number(e.target.value || 0) })
                        }
                      />
                    ) : (
                      c.usedPages ?? 0
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 border rounded-lg p-2 text-center">
                  <div className="text-[11px] text-gray-500">Free Earned</div>
                  <div className="font-bold text-sm">{c.freeEarned ?? 0}</div>
                </div>

                <div className="bg-gray-50 border rounded-lg p-2 text-center">
                  <div className="text-[11px] text-gray-500">Free Left</div>
                  <div className="font-bold text-sm">{c.freeRemaining ?? 0}</div>
                </div>
              </div>

              {/* Primary buttons */}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  disabled={sendingPromo}
                  onClick={() => promoteCustomer(c)}
                  className="w-full bg-yellow-100 text-yellow-800 px-3 py-2 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <Megaphone size={14} />
                  {sendingPromo ? "Sending..." : "Promote"}
                </button>

                <button
                  disabled={sendingInvoice}
                  onClick={() => notifyCustomer(c)}
                  className="w-full bg-indigo-100 text-indigo-700 px-3 py-2 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <MessageSquare size={14} />
                  {sendingInvoice ? "Sending..." : "Notify"}
                </button>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  onClick={() => viewTransactions(c)}
                  className="w-full bg-green-100 text-green-700 px-3 py-2 rounded-lg text-xs font-semibold"
                >
                  Transactions
                </button>

                {isAdmin ? (
                  isEditing ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => saveEdit(c)}
                        className="w-full bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-2"
                      >
                        <Save size={14} /> Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="w-full bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-2"
                      >
                        <X size={14} /> Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEdit(c)}
                      className="w-full bg-orange-100 text-orange-700 px-3 py-2 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-2"
                    >
                      <Edit2 size={14} /> Update
                    </button>
                  )
                ) : (
                  <button
                    disabled
                    className="w-full bg-gray-100 text-gray-400 px-3 py-2 rounded-lg text-xs font-semibold"
                  >
                    View only
                  </button>
                )}
              </div>

              {/* If editing, show deactivate under */}
              {isAdmin && isEditing ? (
                <button
                  onClick={() => deleteCustomer(c.id)}
                  className="mt-2 w-full bg-red-100 text-red-700 px-3 py-2 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-2"
                >
                  <Trash2 size={14} /> Deactivate
                </button>
              ) : null}
            </div>
          );
        })}

        {filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">No customers found.</div>
        ) : null}
      </div>
    </div>
  );
}
