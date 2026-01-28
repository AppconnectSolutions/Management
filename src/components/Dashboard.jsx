import { useState, useMemo } from "react";
import {
  Users,
  TrendingUp,
  Coins,
  AlertCircle,
} from "lucide-react";

export default function Dashboard({
  customers = [],
  transactions = [],
  initialTab = "overview",
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  

  // ============================
  // 📊 CALCULATIONS FROM DB DATA
  // ============================

  const totalLiability = useMemo(() => {
    return customers.reduce(
      (sum, c) => sum + (c.points_balance || 0),
      0
    );
  }, [customers]);

  const todaySales = useMemo(() => {
    const today = new Date().toDateString();
    return transactions
      .filter(t => new Date(t.created_at).toDateString() === today)
      .reduce((sum, t) => sum + (t.total_amount || 0), 0);
  }, [transactions]);

  const todayTransactions = useMemo(() => {
    const today = new Date().toDateString();
    return transactions.filter(
      t => new Date(t.created_at).toDateString() === today
    );
  }, [transactions]);

  const pointsRedeemedToday = useMemo(() => {
    return todayTransactions.reduce(
      (sum, t) => sum + (t.points_redeemed || 0),
      0
    );
  }, [todayTransactions]);

  // ============================
  // 🧾 RECENT TRANSACTIONS TABLE
  // ============================

  const recentTransactions = transactions.slice(0, 8);

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Owner Dashboard
          </h2>
          <span className="text-sm text-gray-500">
            Manage business & inventory
          </span>
        </div>

        <div className="bg-white p-1 rounded-lg border shadow-sm flex">
          {["overview"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeTab === tab
                  ? "bg-indigo-600 text-white"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Overview
            </button>
          ))}
        </div>
      </div>

      {activeTab === "overview" && (
        <>
          {/* STAT CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            <StatCard
              title="Total Points Liability"
              value={`${totalLiability.toLocaleString()} pts`}
              subtitle={`Pending value: ₹${totalLiability}`}
              icon={<AlertCircle size={20} />}
              color="orange"
            />

            <StatCard
              title="Today's Sales"
              value={`₹${todaySales.toLocaleString()}`}
              subtitle={`${todayTransactions.length} transactions`}
              icon={<TrendingUp size={20} />}
              color="green"
            />

            <StatCard
              title="Points Redeemed Today"
              value={pointsRedeemedToday}
              subtitle={`Customers saved ₹${pointsRedeemedToday}`}
              icon={<Coins size={20} />}
              color="blue"
            />

            <StatCard
              title="Total Customers"
              value={customers.length}
              subtitle="Active database"
              icon={<Users size={20} />}
              color="indigo"
            />
          </div>

          {/* RECENT TRANSACTIONS */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-gray-800">
                Recent Transactions (Audit Log)
              </h3>
            </div>

            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-6 py-3">Txn ID</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Bill Amt</th>
                  <th className="px-6 py-3 text-right">Final Amt</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentTransactions.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-mono text-xs">
                      #{t.id}
                    </td>
                    <td className="px-6 py-3">
                      {t.customer_name || "-"}
                    </td>
                    <td className="px-6 py-3">
                      ₹{t.total_amount}
                    </td>
                    <td className="px-6 py-3 text-right font-bold">
                      ₹{t.total_amount}
                    </td>
                  </tr>
                ))}

                {recentTransactions.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-gray-400"
                    >
                      No transactions yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

// ============================
// ♻️ REUSABLE STAT CARD
// ============================
function StatCard({ title, value, subtitle, icon, color }) {
  const colors = {
    orange: "bg-orange-100 text-orange-600",
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
    indigo: "bg-indigo-100 text-indigo-600",
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border">
      <div className="flex justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          {icon}
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-2">{subtitle}</p>
    </div>
  );
}
