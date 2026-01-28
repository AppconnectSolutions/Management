import React, { useEffect, useState } from "react";
import { Printer, Download } from "lucide-react";
import jsPDF from "jspdf";

export default function InvoicePage({ id, onClose }) {
  const [transaction, setTransaction] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        console.log("Fetching invoice for ID:", id);
        const res = await fetch(`${API_URL}/api/transactions/${id}`);
        const data = await res.json();
        console.log("Invoice response:", data);
        setTransaction(data.transaction);
      } catch (err) {
        console.error("Failed to load invoice:", err);
      }
    };
    fetchInvoice();
  }, [id, API_URL]);

  if (!transaction) {
    return (
      <div className="min-h-[200px] flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Loading invoice...</p>
      </div>
    );
  }

  const items = Array.isArray(transaction.items) ? transaction.items : [];
  const subTotal = Number(transaction.subTotal || 0);
  const discount = Number(transaction.discount || 0);
  const finalAmount = Number(transaction.finalAmount || transaction.totalAmount || 0);

  const handleDownload = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Invoice", 20, 20);

    doc.setFontSize(12);
    doc.text(`Bill No: ${transaction.billNo || transaction.transactionId}`, 20, 40);
    doc.text(`Date: ${transaction.date}`, 20, 50);

    let y = 70;
    items.forEach((it) => {
      doc.text(`${it.name} - Qty: ${it.quantity} - ₹${it.line_total}`, 20, y);
      y += 10;
    });

    doc.text(`Subtotal: ₹${subTotal}`, 20, y + 10);
    if (discount > 0) doc.text(`Discount: -₹${discount}`, 20, y + 20);
    doc.text(`Net Payable: ₹${finalAmount}`, 20, y + 30);

    doc.save(`Invoice_${transaction.billNo || transaction.transactionId}.pdf`);
  };

  return (
    <div className="flex flex-col max-h-[90vh]">
      {/* Header */}
      <div className="bg-slate-100 p-4 flex justify-between items-center">
        <h2 className="font-bold text-slate-700">Invoice</h2>
        <button
          onClick={onClose}
          className="text-xs font-bold bg-slate-200 hover:bg-slate-300 px-3 py-1.5 rounded"
        >
          CLOSE
        </button>
      </div>

      {/* Content */}
      <div className="p-6 font-mono text-sm leading-relaxed overflow-y-auto">
        <h1 className="text-xl font-extrabold text-center mb-4">
          K.B. ONLINE WORLD
        </h1>
        <p className="text-xs text-center mb-6">
          Digital Seva • One Stop Services
        </p>

        <p className="text-sm mb-2">Bill No: {transaction.billNo || transaction.transactionId}</p>
        <p className="text-sm mb-4">Date: {transaction.date}</p>

        <table className="w-full text-left mb-4 text-xs">
          <thead>
            <tr className="uppercase">
              <th>Item</th>
              <th className="text-center">Qty</th>
              <th className="text-right">Amt</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => (
              <tr key={idx}>
                <td>{it.name}</td>
                <td className="text-center">{it.quantity}</td>
                <td className="text-right">₹{it.line_total}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t border-black my-2" />

        <p className="font-bold">Subtotal: ₹{subTotal.toFixed(2)}</p>
        {discount > 0 && (
          <p className="font-bold">Discount: -₹{discount.toFixed(2)}</p>
        )}
               <p className="font-bold text-lg mt-2">
          Net Payable: ₹{finalAmount.toFixed(2)}
        </p>
      </div>

      {/* Actions */}
      <div className="p-4 border-t bg-slate-50 flex gap-2">
        <button
          onClick={() => window.print()}
          className="flex-1 bg-slate-900 text-white py-2 rounded-lg flex items-center justify-center gap-2 text-xs font-bold"
        >
          <Printer size={16} /> Print
        </button>
        <button
          onClick={handleDownload}
          className="flex-1 bg-indigo-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 text-xs font-bold"
        >
          <Download size={16} /> Download
        </button>
      </div>
    </div>
  );
}
