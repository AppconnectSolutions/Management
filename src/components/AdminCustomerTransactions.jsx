import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Invoice from "./Invoice";
import { ChevronDown, ChevronRight, FileDown, Layers } from "lucide-react";

/* ================= HELPERS ================= */
function getDefaultFromDate() {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().slice(0, 10);
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function getProductIcon(name = "") {
  const n = name.toLowerCase();
  if (n.includes("xerox") || n.includes("print")) return "🖨️";
  if (n.includes("binding")) return "📘";
  if (n.includes("lamination")) return "📄";
  return "📦";
}

export default function AdminCustomerTransactions() {
  const { mobile } = useParams();
  const navigate = useNavigate();
  const invoiceRef = useRef(null);

  const [customer, setCustomer] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [itemsByTxn, setItemsByTxn] = useState({});
  const [collapsedDates, setCollapsedDates] = useState({});
  const [loading, setLoading] = useState(true);

  const [fromDate, setFromDate] = useState(getDefaultFromDate());
  const [toDate, setToDate] = useState(getTodayDate());

  const [pdfInvoiceData, setPdfInvoiceData] = useState(null);

  const API_URL =
    process.env.REACT_APP_API_URL || "http://localhost:5000";

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const res = await fetch(
        `${API_URL}/api/transactions/customer/${mobile}`
      );
      const json = await res.json();

      setCustomer(json.customer || {});
      setTransactions(json.transactions || []);

      const map = {};
      for (const t of json.transactions || []) {
        const r = await fetch(
          `${API_URL}/api/transactions/items/${t.transactionId}`
        );
        map[t.transactionId] = await r.json();
      }

      setItemsByTxn(map);
      setLoading(false);
    };

    load();
  }, [mobile, API_URL]);

  if (loading) {
    return <div className="p-6 text-center">Loading…</div>;
  }

  /* ================= FILTER + GROUP ================= */
  const filtered = transactions.filter((t) => {
    const d = new Date(t.date).toISOString().slice(0, 10);
    return d >= fromDate && d <= toDate;
  });

  const grouped = filtered.reduce((acc, t) => {
    const key = new Date(t.date).toISOString().slice(0, 10);
    acc[key] = acc[key] || [];
    acc[key].push(t);
    return acc;
  }, {});

  /* ================= DOWNLOAD INVOICE PDF ================= */
const downloadDateInvoicesPDF = async (dateKey, txns) => {
  try {
    const pdf = new jsPDF("p", "mm", "a4");

    const pageWidth = 210;
    const pageHeight = 297;

    for (let i = 0; i < txns.length; i++) {
      const txnId = txns[i].transactionId;

      // 1️⃣ Fetch invoice data
      const res = await fetch(`${API_URL}/api/transactions/${txnId}`);
      const json = await res.json();

      setPdfInvoiceData(json.transaction);

      // 2️⃣ Wait for invoice render
      await new Promise((r) => setTimeout(r, 400));

      if (!invoiceRef.current) continue;

      // 3️⃣ Capture invoice
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);

      // 4️⃣ Calculate scaling
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // 5️⃣ Add first page
      if (i > 0) pdf.addPage();

      pdf.addImage(
        imgData,
        "JPEG",
        0,
        position,
        imgWidth,
        imgHeight
      );

      heightLeft -= pageHeight;

      // 6️⃣ Split overflow safely into pages
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(
          imgData,
          "JPEG",
          0,
          position,
          imgWidth,
          imgHeight
        );
        heightLeft -= pageHeight;
      }
    }

    pdf.save(`Invoices_${dateKey}.pdf`);
    setPdfInvoiceData(null);
  } catch (err) {
    console.error("PDF error", err);
  }
};




  return (
    <div className="p-4 sm:p-6 bg-slate-100 min-h-screen">
      {/* ================= HEADER ================= */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-800 rounded-xl px-4 sm:px-8 py-5 mb-6 flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between items-start sm:items-center shadow-lg">
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-16">
          <div>
            <p className="text-slate-400 text-xs">Name</p>
            <p className="text-white text-xl sm:text-2xl font-bold">
              {customer.name}
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-xs">Phone</p>
            <p className="text-white font-mono text-sm sm:text-base">
              {customer.mobile}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/admin/customers")}
          className="text-white font-semibold text-sm hover:underline"
        >
          ← Back
        </button>
      </div>

      {/* ================= FILTER ================= */}
      <div className="bg-white rounded-xl p-4 mb-6 flex flex-col sm:flex-row gap-3 shadow">
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="border px-3 py-2 rounded text-sm w-full sm:w-auto"
        />
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="border px-3 py-2 rounded text-sm w-full sm:w-auto"
        />
      </div>

      {/* ================= DATES ================= */}
      <div className="space-y-6">
        {Object.entries(grouped).map(([date, txns]) => {
          const collapsed = collapsedDates[date];

          const rows = txns.flatMap((t) =>
            (itemsByTxn[t.transactionId] || []).map((i) => ({
              bill: t.transactionId,
              ...i,
            }))
          );

          const totalQty = rows.reduce(
            (s, r) => s + Number(r.quantity || 0),
            0
          );

          return (
            <div key={date} className="bg-white rounded-xl shadow border">
              {/* DATE HEADER */}
              <div className="flex flex-col sm:flex-row justify-between gap-3 items-start sm:items-center bg-slate-800 text-white px-4 sm:px-6 py-4">
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() =>
                    setCollapsedDates({
                      ...collapsedDates,
                      [date]: !collapsed,
                    })
                  }
                >
                  {collapsed ? <ChevronRight /> : <ChevronDown />}
                  <span className="font-semibold">
                    {new Date(date).toDateString()}
                  </span>
                  <span className="text-xs bg-slate-600 px-2 py-0.5 rounded">
                    {txns.length} Bills
                  </span>
                </div>

          
                <div className="flex items-center gap-4">
  <span className="text-sm flex gap-1">
    <Layers size={14} /> Qty: {totalQty}
  </span>

{/* <button
  onClick={() => downloadDateInvoicesPDF(date, txns)}
  className="bg-green-600 text-white text-xs px-4 py-2 rounded flex items-center gap-2"
>
  <FileDown size={14} /> PDF
</button> */}


</div>

              </div>

              {!collapsed && (
                <div className="overflow-x-auto">
                  <table className="min-w-[640px] w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-3 py-2 text-left">Bill</th>
                        <th className="px-3 py-2 text-left">Item</th>
                        <th className="px-3 py-2 text-center">Qty</th>
                        <th className="px-3 py-2 text-right">Rate</th>
                        <th className="px-3 py-2 text-right">Amount</th>
                        
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="px-3 py-2 font-mono">
                            #{r.bill}
                          </td>
                          <td className="px-3 py-2">
                            {getProductIcon(r.productName)}{" "}
                            {r.productName}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {r.quantity}
                          </td>
                          <td className="px-3 py-2 text-right">
                            ₹{r.unit_price}
                          </td>
                          <td className="px-3 py-2 text-right font-semibold">
                            ₹{r.line_total}
                          </td>
                          
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ================= HIDDEN INVOICE ================= */}
      <div
        style={{
          position: "fixed",
          left: "-9999px",
          top: 0,
          width: "320px",
        }}
      >
        {pdfInvoiceData && (
          <div ref={invoiceRef}>
            <Invoice data={pdfInvoiceData} />
          </div>
        )}
      </div>
    </div>
  );
}
