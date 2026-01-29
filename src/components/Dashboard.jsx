import { useEffect, useState } from "react";
import {
  Users,
  TrendingUp,
  Coins,
  AlertCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {useMemo } from "react";


const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [todayProducts, setTodayProducts] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [dailyChart, setDailyChart] = useState([]);

  const totalProductsSoldToday = useMemo(() => {
  return todayProducts.reduce(
    (sum, p) => sum + Number(p.qty || 0),
    0
  );
}, [todayProducts]);


  /* ================= LOAD DASHBOARD ================= */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/api/dashboard/summary`);
        const json = await res.json();

        setStats(json.stats || {});
        setTodayProducts(json.todayProducts || []);
        setRecentTransactions(json.recentTransactions || []);

        // Fetch chart data
        const chartRes = await fetch(
          `${API_URL}/api/dashboard/chart/daily`
        );
        const chartJson = await chartRes.json();
        setDailyChart(chartJson || []);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-500">
        Loading dashboard…
      </div>
    );
  }

  return (
    <div
      id="dashboard-root"
      className="p-4 sm:p-6 space-y-6 bg-slate-100 min-h-screen"
    >
      {/* ================= HEADER ================= */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          Owner Dashboard
        </h2>
        <p className="text-sm text-gray-500">
          Daily business overview
        </p>
      </div>

      {/* ================= KPI CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers || 0}
          subtitle="Active customers"
          icon={<Users size={20} />}
          color="indigo"
        />

        <StatCard
          title="Today's Sales"
          value={`₹${Number(stats.todaySales || 0).toLocaleString()}`}
          subtitle={`${stats.todayTransactions || 0} transactions`}
          icon={<TrendingUp size={20} />}
          color="green"
        />

       <StatCard
  title="Products / Services Sold"
  value={totalProductsSoldToday}
  subtitle="Today"
  icon={<Coins size={20} />}
  color="blue"
/>


        <StatCard
          title="Net Revenue"
          value={`₹${Number(stats.todaySales || 0).toLocaleString()}`}
          subtitle="After offers"
          icon={<Coins size={20} />}
          color="blue"
        />
      </div>

      {/* ================= DAILY SALES CHART ================= */}
     
      {/* ================= TODAY PRODUCT SALES ================= */}
      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-gray-800">
              Today’s Product Sales
            </h3>
            <p className="text-xs text-gray-500">
              {new Date().toDateString()}
            </p>
          </div>
          <span className="text-sm text-gray-600">
            {todayProducts.length} products
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[600px] w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-3 text-left">Product</th>
                <th className="px-6 py-3 text-center">Qty</th>
                <th className="px-6 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {todayProducts.map((p, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-3">{p.product}</td>
                  <td className="px-6 py-3 text-center font-medium">
                    {p.qty}
                  </td>
                  <td className="px-6 py-3 text-right font-bold">
                    ₹{Number(p.amount).toFixed(2)}
                  </td>
                </tr>
              ))}

              {todayProducts.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-8 text-center text-gray-400"
                  >
                    No sales today
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= RECENT TRANSACTIONS ================= */}
      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-800">
            Recent Transactions
          </h3>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-6 py-3">Txn ID</th>
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {recentTransactions.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-6 py-3 font-mono text-xs">
                  #{t.id}
                </td>
                <td className="px-6 py-3">
                  {t.customer_name}
                </td>
                <td className="px-6 py-3 text-right font-bold">
                  ₹{t.total_amount}
                </td>
              </tr>
            ))}

            {recentTransactions.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="px-6 py-8 text-center text-gray-400"
                >
                  No transactions yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================= STAT CARD ================= */
function StatCard({ title, value, subtitle, icon, color }) {
  const colors = {
    orange: "bg-orange-100 text-orange-600",
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
    indigo: "bg-indigo-100 text-indigo-600",
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow border">
      <div className="flex justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          {icon}
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-2">
        {subtitle}
      </p>
    </div>
  );
}
