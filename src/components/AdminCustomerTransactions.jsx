import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Invoice from "./Invoice";

/* ================= HELPERS ================= */
function getDefaultFromDate() {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().slice(0, 10);
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

/* ================= COMPONENT ================= */
export default function AdminCustomerTransactions() {
  const { mobile } = useParams();
  const invoiceRef = useRef(null);

  const [data, setData] = useState({ customer: {}, transactions: [] });
  const [loading, setLoading] = useState(true);
  const [invoiceData, setInvoiceData] = useState(null);

  const [fromDate, setFromDate] = useState(getDefaultFromDate());
  const [toDate, setToDate] = useState(getTodayDate());

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/transactions/customer/${mobile}`
        );
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [mobile, API_URL]);

  if (loading) return <div className="p-10">Loading…</div>;
  if (!data?.transactions)
    return <div className="p-10 text-gray-500">No transactions</div>;

  const { customer, transactions } = data;

  /* ================= DATE FILTER ================= */
  const filteredTransactions = transactions.filter((t) => {
    const d = new Date(t.date).toISOString().slice(0, 10);
    return d >= fromDate && d <= toDate;
  });

  /* ================= VIEW INVOICE ================= */
 const openInvoice = async (txnId) => {
  try {
    const res = await fetch(`${API_URL}/api/transactions/${txnId}`);

    if (!res.ok) {
      const text = await res.text(); // ⛔ do NOT parse as JSON
      console.error("Invoice API error:", text);
      return;
    }

    const json = await res.json();
    console.log("Invoice API response:", json);

    if (json.transaction) {
      setInvoiceData(json.transaction);
    } else {
      console.error("Missing transaction key", json);
    }
  } catch (err) {
    console.error("Invoice fetch failed:", err);
  }
};


  /* ================= DOWNLOAD EXCEL ================= */
  const downloadExcel = () => {
    const rows = [
      ["Transaction ID", "Date", "Amount"],
      ...filteredTransactions.map((t) => [
        t.transactionId,
        new Date(t.date).toISOString().replace("T", " ").slice(0, 19),
        t.totalAmount,
      ]),
    ];

    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `transactions_${fromDate}_to_${toDate}.csv`;
    a.click();
  };

  /* ================= DOWNLOAD INVOICE PDF ================= */
  const downloadInvoicePDF = async () => {
    const canvas = await html2canvas(invoiceRef.current, {
      scale: 2,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgHeight);
    pdf.save(`invoice_${invoiceData.transactionId}.pdf`);
  };

  return (
    <div className="p-6 bg-slate-100 min-h-screen">
      {/* ================= CUSTOMER HEADER ================= */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl px-8 py-6 mb-6">
        <div className="grid grid-cols-2 gap-20">
          <div>
            <p className="text-slate-300 text-sm">Customer Name</p>
            <p className="text-white text-2xl font-bold">
              {customer.name}
            </p>
          </div>
          <div>
            <p className="text-slate-300 text-sm">Mobile</p>
            <p className="text-white text-xl font-mono">
              {customer.mobile}
            </p>
          </div>
        </div>
      </div>

      {/* ================= FILTER BAR ================= */}
      <div className="bg-white rounded-xl p-4 mb-4 flex flex-wrap gap-4 items-end shadow">
        <div>
          <label className="text-xs text-gray-600">From Date</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border px-3 py-2 rounded text-sm"
          />
        </div>

        <div>
          <label className="text-xs text-gray-600">To Date</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border px-3 py-2 rounded text-sm"
          />
        </div>

        <button
          onClick={downloadExcel}
          className="bg-green-600 text-white px-5 py-2 rounded text-sm"
        >
          Download Excel
        </button>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">Txn ID</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((t) => (
              <tr key={t.transactionId} className="border-t">
                <td className="px-4 py-3 font-mono">
                  #{t.transactionId}
                </td>
                <td className="px-4 py-3">
                  {new Date(t.date).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right font-bold">
                  ₹{t.totalAmount}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => openInvoice(t.transactionId)}
                    className="bg-indigo-600 text-white px-3 py-1 rounded text-xs"
                  >
                    View Invoice
                  </button>
                </td>
              </tr>
            ))}

            {filteredTransactions.length === 0 && (
              <tr>
                <td colSpan="4" className="p-6 text-center text-gray-400">
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= INVOICE POPUP ================= */}
      {invoiceData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="relative">
            <div ref={invoiceRef}>
              <Invoice
                data={invoiceData}
                onClose={() => setInvoiceData(null)}
              />
            </div>

            <div className="flex gap-3 justify-center mt-4">
              <button
                onClick={downloadInvoicePDF}
                className="bg-green-600 text-white px-4 py-2 rounded text-sm"
              >
                Download PDF
              </button>
              <button
                onClick={() => setInvoiceData(null)}
                className="bg-gray-300 px-4 py-2 rounded text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
