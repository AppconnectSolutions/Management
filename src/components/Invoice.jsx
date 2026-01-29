import React from "react";
import { Printer } from "lucide-react";

const Invoice = ({ data, onClose }) => {
  const transaction = data;
  if (!transaction) return null;

  const items = Array.isArray(transaction.items) ? transaction.items : [];

  /* ===========================
     ✅ CORRECT CALCULATIONS
  =========================== */

  // Subtotal = sum of PAID amounts only
  const subTotal = items.reduce(
    (sum, it) => sum + Number(it.line_total || 0),
    0
  );

  // Discount = money saved from free pages (from backend)
  const discount = Number(transaction.discount || 0);

  // Net payable is already discounted
  const finalAmount = subTotal;

  /* ===========================
     XEROX SUMMARY DATA
  =========================== */
  const xeroxRequested = Number(transaction.xeroxRequested || 0);
  const xeroxPaid = Number(transaction.xeroxPaid || 0);
  const xeroxFreeUsed = Number(transaction.xeroxFreeUsed || 0);

  /* ===========================
     HELPERS
  =========================== */
  const formatQty = (it) => {
    const paid = Number(it.paid_qty ?? it.quantity ?? 0);
    const free = Number(it.free_qty || 0);
    return free > 0 ? `${paid} + ${free} FREE` : `${paid}`;
  };
  const freeRemaining =
  Math.max(
    (transaction.xeroxFreeEarned || 0) - xeroxFreeUsed,
    0
  );


  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full overflow-hidden flex flex-col max-h-[90vh]">

        {/* ================= ACTION BAR ================= */}
        <div className="bg-slate-100 p-3 border-b flex justify-between items-center no-print">
          <span className="font-bold text-slate-700 flex items-center gap-2 text-sm">
            <Printer size={16} /> Print Preview
          </span>
          <button
            onClick={onClose}
            className="text-xs font-bold bg-slate-200 hover:bg-slate-300 px-3 py-1.5 rounded"
          >
            CLOSE
          </button>
        </div>

        {/* ================= RECEIPT ================= */}
        <div className="p-8 overflow-y-auto font-mono text-sm bg-white text-black">

          {/* HEADER */}
          <div className="text-center mb-6">
            <h1 className="text-xl font-extrabold border-b-2 border-black inline-block pb-1 mb-2">
              K.B. ONLINE WORLD
            </h1>
            <p className="text-[10px] font-bold uppercase">
              Digital Seva • One Stop Services
            </p>
            <p className="text-[9px] text-gray-600 mt-1">
              Xerox | Online Apps | CCTV | Mobile Acc.
            </p>
            <p className="text-[10px] mt-1">CSC ID: 665583460014</p>
          </div>

          <div className="flex justify-between text-xs mb-1">
            <span>
              BILL NO : <strong>{transaction.transactionId || "N/A"}</strong>
            </span>
          </div>

          <div className="flex justify-between text-xs mb-4">
            <span>DATE : {transaction.date || "N/A"}</span>
          </div>

          <div className="border-t border-black mb-2" />

          {/* ITEMS */}
          <table className="w-full text-xs mb-2">
            <thead>
              <tr>
                <th className="py-1 text-left">ITEM</th>
                <th className="py-1 text-center">QTY</th>
                <th className="py-1 text-right">AMT</th>
              </tr>
            </thead>
            <tbody>
              {items.length ? (
                items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="py-1 pr-2 truncate max-w-[120px]">
                      {it.name || "N/A"}
                    </td>
                    <td className="py-1 text-center">
                      {formatQty(it)}
                    </td>
                    <td className="py-1 text-right">
                      ₹{Number(it.line_total || 0).toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="py-3 text-center text-gray-400">
                    No items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="border-t border-black mb-2" />

          {/* TOTALS */}
          <div className="flex justify-between font-bold text-sm">
            <span>SUB TOTAL</span>
            <span>₹{subTotal.toFixed(2)}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-sm font-bold mt-1">
              <span>OFFER SAVINGS</span>
              <span>-₹{discount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between font-bold text-lg mt-3 pt-2 border-t-2 border-dashed border-black">
            <span>NET PAYABLE</span>
            <span>₹{finalAmount.toFixed(2)}</span>
          </div>

          {/* XEROX SUMMARY */}
          {xeroxRequested > 0 && (
  <div className="mt-5 pt-4 border-t border-black text-sm">
    <p className="font-extrabold mb-3 text-center tracking-wide">
      XEROX OFFER SUMMARY
    </p>

    <div className="flex justify-between font-bold">
      <span>Total Pages:</span>
      <span>{xeroxRequested}</span>
    </div>

    <div className="flex justify-between font-bold">
      <span>Paid Pages:</span>
      <span>{xeroxPaid}</span>
    </div>

    <div className="flex justify-between font-bold">
      <span>Free Pages Used:</span>
      <span>{xeroxFreeUsed}</span>
    </div>

    {/* ⭐ IMPORTANT LINE */}
    <div className="flex justify-between font-extrabold text-base mt-2">
      <span>Remaining Free Pages:</span>
      <span>{freeRemaining}</span>
    </div>

    <div className="flex justify-between font-bold mt-2">
      <span>You Saved:</span>
      <span>₹{discount.toFixed(2)}</span>
    </div>
  </div>
)}


          <div className="mt-6 text-center text-[10px] opacity-80">
            <p>* Thank you for visiting K.B. Online World *</p>
            <p className="font-bold mt-2">Developed by AppConnect Solutions</p>
          </div>
        </div>

        {/* PRINT BUTTON */}
        <div className="p-4 border-t bg-slate-50 no-print">
          <button
            onClick={() => window.print()}
            className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 uppercase text-xs"
          >
            <Printer size={16} /> Print Receipt
          </button>
        </div>

      </div>
    </div>
  );
};

export default Invoice;
