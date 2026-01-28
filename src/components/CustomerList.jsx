import { useState, useEffect, useRef } from "react";
import { Users, MessageSquare, Upload, Megaphone } from "lucide-react";
import html2canvas from "html2canvas";
import Invoice from "./Invoice";
import { createRoot } from "react-dom/client";
import { useNavigate } from "react-router-dom";


const WA_TAB_NAME = "WHATSAPP_WEB_TAB";

function normalizePhone(mobile) {
  let digits = String(mobile || "").replace(/\D/g, "");

  // remove leading 0 (optional)
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);

  // if already 91XXXXXXXXXX keep it
  if (digits.length === 12 && digits.startsWith("91")) return digits;

  // add India code if only 10 digits
  if (digits.length === 10) digits = "91" + digits;

  return digits;
}

// ✅ IMPORTANT: use send?phone= (NOT send/?phone=)
function buildWaUrl(phone, text) {
  const msg = encodeURIComponent(text || "");
  return `https://web.whatsapp.com/send?phone=${phone}&text=${msg}&app_absent=0`;
}

export default function CustomerList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);
const [editForm, setEditForm] = useState({
  name: "",
  mobile: "",
  usedPages: 0, // ✅ ADD THIS
});
const loggedUser = JSON.parse(localStorage.getItem("admin") || "null");
const isAdmin = loggedUser?.role === "ADMIN";


  const [sendingInvoice, setSendingInvoice] = useState(false);
  const [sendingPromo, setSendingPromo] = useState(false);

  const [activePromo, setActivePromo] = useState({
    id: null,
    title: "",
    message:
      "🔥 Special Offer! Xerox & Services available. Visit today and get best deals!",
    is_active: 0,
  });

  const waWindowRef = useRef(null);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // ✅ Always reuse ONE WhatsApp tab
  const getOrOpenWhatsAppTab = () => {
    if (waWindowRef.current && !waWindowRef.current.closed) {
      waWindowRef.current.focus();
      return waWindowRef.current;
    }

    // Open named tab. If already exists, it will be reused.
    const win = window.open("about:blank", WA_TAB_NAME);
    if (!win) {
      alert("Popup blocked! Please allow popups for this site.");
      return null;
    }

    // Load WhatsApp Web in that same tab
    win.location.href = "https://web.whatsapp.com/";
    waWindowRef.current = win;
    win.focus();
    return win;
  };

  /* ---------------- FETCH ACTIVE PROMO FROM DB ---------------- */
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

  /* ---------------- FETCH REWARDS ---------------- */
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

  /* ---------------- FETCH CUSTOMERS ---------------- */
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

  /* ---------------- CSV UPLOAD ---------------- */
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

  /* ---------------- PROMOTE CUSTOMER ---------------- */
  const promoteCustomer = async (customer) => {
    if (!customer?.mobile) return;

    const waWin = getOrOpenWhatsAppTab();
    if (!waWin) return;

    try {
      setSendingPromo(true);

      // fetch latest promo and use returned value (no state timing issue)
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

  /* ---------------- NOTIFY CUSTOMER (INVOICE) ---------------- */
  const notifyCustomer = async (customer) => {
    if (!customer?.mobile) return;

    // ✅ Open/reuse tab immediately (user click moment)
    const waWin = getOrOpenWhatsAppTab();
    if (!waWin) return;

    // ✅ Jump to customer chat immediately (so WhatsApp locks onto that phone)
    const phone = normalizePhone(customer.mobile);
    waWin.location.href = buildWaUrl(
      phone,
      `Hi ${customer.name || ""}, preparing your invoice...`
    );
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

      // ✅ Now update same chat with final message
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
  const navigate = useNavigate();
 const viewTransactions = (customer) => {
  navigate(`/admin/customers/${customer.mobile}/transactions`);
};



  // OR Example 2: open in new tab
  // window.open(`/transactions/${customer.mobile}`, "_blank");

  // OR Example 3: open modal (if you already use one)

const startEdit = (c) => {
  if (!isAdmin) return;   // ✅ ADD THIS LINE

  setEditingId(c.id);
  setEditForm({
    name: c.name || "",
    mobile: c.mobile || "",
    usedPages: c.usedPages ?? 0,
  });
};


const cancelEdit = () => {
  setEditingId(null);
  setEditForm({ name: "", mobile: "" });
};

const saveEdit = async (customer) => {
   if (!isAdmin) return;
  // 1️⃣ Update name & mobile
  await fetch(`${API_URL}/api/customers/${customer.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: editForm.name,
      mobile: editForm.mobile,
    }),
  });

  // 2️⃣ Update Xerox pages
  await fetch(`${API_URL}/api/customers/${customer.id}/adjust-xerox`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      totalPrinted: Number(editForm.usedPages),
    }),
  });

  await fetchCustomers(); // refresh list
  cancelEdit();
};

const deleteCustomer = async (id) => {
  if (!isAdmin) return;
  if (!window.confirm("Deactivate this customer?")) return;

  await fetch(`${API_URL}/api/customers/${id}`, {
    method: "DELETE",
  });

  fetchCustomers();
};



  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* HEADER */}
      <div className="p-4 border-b flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3 bg-gray-50">
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

        <div className="flex flex-col lg:flex-row gap-3 lg:items-center w-full lg:w-auto">
          <label className="bg-indigo-600 text-white px-3 py-2 rounded cursor-pointer text-sm flex items-center gap-2 w-fit">
            <Upload size={16} />
            {uploading ? "Uploading..." : "Upload CSV"}
            <input type="file" hidden accept=".csv" onChange={handleUpload} />
          </label>

          <input
            className="border px-3 py-2 rounded text-sm"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE */}
      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3">Name</th>
            <th className="px-6 py-3">Mobile</th>
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
          {customers
  .filter((c) => c.is_active !== 0) // 🔥 HIDE DEACTIVATED CUSTOMERS
  .filter(
    (c) =>
      (c.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.mobile || "").includes(searchTerm)
  )
  .map((c) => (

              <tr key={c.id} className="border-t">
                <td className="px-6 py-3 font-bold">
  {editingId === c.id ? (
    <input
      className="border px-2 py-1 rounded text-sm w-full"
      value={editForm.name}
      onChange={(e) =>
        setEditForm({ ...editForm, name: e.target.value })
      }
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
      onChange={(e) =>
        setEditForm({ ...editForm, mobile: e.target.value })
      }
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
        setEditForm({
          ...editForm,
          usedPages: Number(e.target.value || 0),
        })
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
      <>
        <button
          onClick={() => saveEdit(c)}
          className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs mr-2"
        >
          Save
        </button>

        <button
          onClick={cancelEdit}
          className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
        >
          Cancel
        </button>
      </>
    ) : (
      <>
        <button
          onClick={() => startEdit(c)}
          className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs mr-2"
        >
          Update
        </button>

        <button
          onClick={() => deleteCustomer(c.id)}
          className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs"
        >
          Deactivate
        </button>
      </>
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
  );
}
