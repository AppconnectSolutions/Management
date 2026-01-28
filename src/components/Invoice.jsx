import React from "react";
import { Printer } from "lucide-react";

const Invoice = ({ data, onClose }) => {
  const transaction = data;
  if (!transaction) return null;

  const items = Array.isArray(transaction.items) ? transaction.items : [];

 const subTotal = Number(
  transaction.totalAmount ??
  transaction.total_amount ??
  0
);

const discount = Number(transaction.discount || 0); // keep for future
const finalAmount = subTotal - discount;


  const xeroxRequested = Number(transaction.xeroxRequested || 0);
  const xeroxPaid = Number(transaction.xeroxPaid || 0);
  const xeroxFreeUsed = Number(transaction.xeroxFreeUsed || 0);
  const freeRemaining = Number(transaction.freeRemaining || 0);
  const freeEarned = Number(transaction.freeEarned || xeroxFreeUsed + freeRemaining);

  const formatQty = (it) => {
    const paid = Number(it.paid_quantity ?? it.quantity ?? 0);
    const free = Number(it.free_quantity || 0);
    return free > 0 ? `${paid} + ${free} FREE` : `${paid}`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* ACTION BAR */}
        <div className="bg-slate-100 p-3 border-b flex justify-between items-center no-print">
          <span className="font-bold text-slate-700 flex items-center gap-2 text-sm">
            <Printer size={16} /> Print Preview
          </span>
          <button
            onClick={onClose}
            className="text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1.5 rounded transition-colors"
          >
            CLOSE
          </button>
        </div>

        {/* RECEIPT */}
        <div className="p-8 overflow-y-auto font-mono text-sm leading-relaxed bg-white text-black">
          <div className="text-center mb-6">
            <h1 className="text-xl font-extrabold tracking-wider border-b-2 border-black inline-block pb-1 mb-2">
              K.B. ONLINE WORLD
            </h1>
            <p className="text-[10px] uppercase tracking-wide font-bold">
              Digital Seva • One Stop Services
            </p>
            <p className="text-[9px] mt-1 text-gray-600">
              Xerox | Online Apps | CCTV | Mobile Acc.
            </p>
            <p className="text-[10px] mt-1">CSC ID: 665583460014</p>
          </div>

          <div className="flex justify-between text-xs mb-1">
            <span>
              BILL NO : <strong>{transaction.billNo || "N/A"}</strong>
            </span>
          </div>
          <div className="flex justify-between text-xs mb-4">
            <span>DATE : {transaction.date || "N/A"}</span>
          </div>

          <div className="border-t border-black mb-2" />

          {/* ITEMS */}
          <table className="w-full text-left mb-2 text-xs">
            <thead>
              <tr className="uppercase">
                <th className="py-1">Item</th>
                <th className="py-1 text-center">Qty</th>
                <th className="py-1 text-right">Amt</th>
              </tr>
            </thead>
            <tbody>
              {items.length ? (
                items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="py-1 pr-2 truncate max-w-[120px]">{it?.name || "N/A"}</td>
                    <td className="py-1 text-center">{formatQty(it)}</td>
                    <td className="py-1 text-right">₹{Number(it.line_total || 0)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="py-2 text-center text-gray-500 text-[10px]">
                    No items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="border-t border-black mb-2" />

          <div className="flex justify-between font-bold text-sm mb-1">
            <span>SUB TOTAL</span>
            <span>₹{subTotal.toFixed(2)}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between font-bold text-sm mb-1">
              <span>DISCOUNT (FREE PAGES)</span>
              <span>-₹{discount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between font-bold text-lg mt-3 pt-2 border-t-2 border-black border-dashed">
            <span>NET PAYABLE</span>
            <span>₹{finalAmount.toFixed(2)}</span>
          </div>

          {/* XEROX DETAIL SUMMARY */}
          {xeroxRequested > 0 && (
            <div className="mt-5 pt-3 border-t border-gray-300 text-[11px]">
              <p className="font-bold mb-1">XEROX SUMMARY</p>
              <div className="flex justify-between">
                <span>Total Pages Requested:</span>
                <span className="font-bold">{xeroxRequested}</span>
              </div>
              <div className="flex justify-between">
                <span>Paid Pages:</span>
                <span className="font-bold">{xeroxPaid}</span>
              </div>
              <div className="flex justify-between">
                <span>Free Pages Used:</span>
                <span className="font-bold">{xeroxFreeUsed}</span>
              </div>
              <div className="flex justify-between">
                <span>Free Pages Remaining:</span>
                <span className="font-bold">{freeRemaining}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Free Pages Earned:</span>
                <span className="font-bold">{freeEarned}</span>
              </div>
              <div className="flex justify-between">
                <span>Offer Savings:</span>
                <span className="font-bold">₹{discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Final Amount Paid:</span>
                <span className="font-bold">₹{finalAmount.toFixed(2)}</span>
              </div>
            </div>
          )}

          <div className="mt-6 text-center text-[10px] space-y-1 opacity-80">
            <p>* Thank you for visiting K.B. Online World *</p>
            <p className="font-bold mt-3 text-xs">Developed by AppConnect Solutions</p>
          </div>
        </div>

        {/* PRINT BUTTON */}
        <div className="p-4 border-t no-print bg-slate-50">
          <button
            onClick={() => window.print()}
            className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors uppercase tracking-widest text-xs"
          >
            <Printer size={16} /> Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
