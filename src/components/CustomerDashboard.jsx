import { useState, useEffect } from "react";
import { LogOut, History, Receipt, Printer } from "lucide-react";
import InvoicePage from "./InvoicePage";

/* ---------------- NORMALIZE REWARDS ---------------- */
function normalizeRewards(apiRewards) {
  if (!apiRewards?.xerox) return {};

  const xerox = apiRewards.xerox;

  const totalPrinted = Number(xerox.totalPrinted || 0);
  const paidTotal = Number(xerox.paid_total || 0);
  const freeRemaining = Number(xerox.free_remaining || 0);

  const freeUsed = Math.max(totalPrinted - paidTotal, 0);
  const freeEarned = freeRemaining + freeUsed;

  return {
    xerox: {
      total: totalPrinted,
      free: freeEarned,
      remaining: freeRemaining,
      free_quantity: Number(xerox.free_quantity || 0),
      buy_quantity: Number(xerox.buy_quantity || 0),
      next_unlock_in: Number(xerox.next_unlock_in || 0),
    },
  };
}

export default function CustomerDashboard({ loggedInCustomer, onLogout }) {
  const [myTransactions, setMyTransactions] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [rewards, setRewards] = useState({});
  const [showChangePasswordPopup, setShowChangePasswordPopup] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    if (!loggedInCustomer?.mobile) return;

    const fetchData = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/transactions/customer/${loggedInCustomer.mobile}`
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed");

        setMyTransactions(data.transactions || []);
        setRewards(normalizeRewards(data.rewards));
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
    };

    fetchData();

    if (loggedInCustomer?.isDefaultPassword) {
      setShowChangePasswordPopup(true);
    }
  }, [loggedInCustomer, API_URL]);

  /* ---------------- SAFETY GUARD ---------------- */
  if (!loggedInCustomer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500 text-sm">
          Loading customer dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl flex flex-col">

        {/* ---------------- HEADER ---------------- */}
        <div className="bg-indigo-700 text-white p-6 rounded-b-3xl shadow-lg">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-indigo-200 text-xs uppercase font-bold">
                Welcome Back
              </p>
              <h1 className="text-2xl font-bold">
                {loggedInCustomer.name || "Customer"}
              </h1>
            </div>

            <button
              onClick={onLogout}
              className="p-2 bg-indigo-600 rounded-lg hover:bg-indigo-500"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* ---------------- REWARDS ---------------- */}
        <div className="p-6 -mt-4">
          {Object.keys(rewards).length === 0 ? (
            <p className="text-gray-500 text-sm text-center">
              No rewards yet.
            </p>
          ) : (
            Object.entries(rewards).map(([key, reward]) => {
              const pagesLeft = Math.max(reward.remaining, 0);

              return (
                <div
                  key={key}
                  className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Printer size={18} className="text-green-600" />
                    <h3 className="font-bold text-green-700">
                      Xerox Summary
                    </h3>
                  </div>

                  <div className="text-sm text-gray-700 space-y-1">
                    <p>
                      Total Purchased: <strong>{reward.total}</strong>
                    </p>
                    <p>
                      Free Items Earned: <strong>{reward.free}</strong>
                    </p>
                    <p>
                      Remaining Free Items: <strong>{pagesLeft}</strong>
                    </p>
                  </div>

                  <p className="mt-3 text-xs text-green-800 bg-green-100 px-3 py-2 rounded-lg text-center font-semibold">
                    {pagesLeft > 0
                      ? `Only ${reward.next_unlock_in} more to unlock ${reward.free_quantity} FREE items`
                      : `Reward unlocked! Enjoy your free items 🎉`}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* ---------------- TRANSACTIONS ---------------- */}
        <div className="flex-1 px-6 pb-6 overflow-y-auto">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <History size={18} className="text-indigo-600" />
            Transaction History
          </h3>

          {myTransactions.length === 0 ? (
            <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed">
              <Receipt size={32} className="mb-2 opacity-20" />
              <p>No transactions yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myTransactions.map((txn) => (
                <div
                  key={txn.transactionId}
                  className="bg-white border rounded-xl p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold">
                        Bill #{txn.transactionId}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(txn.date).toLocaleString()}
                      </p>
                    </div>
                    <span className="font-bold">
                      ₹{txn.totalAmount}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedInvoice(txn.transactionId)}
                    className="w-full mt-3 py-2 text-indigo-600 text-xs font-bold border rounded hover:bg-indigo-50 flex items-center justify-center gap-2"
                  >
                    <Receipt size={14} />
                    View Digital Copy
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ---------------- INVOICE MODAL ---------------- */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full overflow-hidden">
            <InvoicePage id={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
          </div>
        </div>
      )}

      {/* ---------------- PASSWORD WARNING ---------------- */}
      {showChangePasswordPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
            <h2 className="text-lg font-bold mb-4">
              Change Your Password
            </h2>
            <p className="mb-4">
              You are using the default password. Please update it.
            </p>
            <button
              onClick={() => setShowChangePasswordPopup(false)}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
