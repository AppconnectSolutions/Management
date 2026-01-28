import { useState } from "react";
import { ArrowLeft, Lock, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";



  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      // OPTIONAL: store admin info
      localStorage.setItem("admin", JSON.stringify(data.admin));

      navigate("/admin/dashboard"); // ✅ redirect after success
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 relative">

      {/* BACK */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 text-gray-500 hover:text-gray-800 flex items-center gap-1 text-sm"
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* CARD */}
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">

        {/* HEADER */}
        <div className="p-8 text-center bg-indigo-600 text-white">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-bold">Owner / Staff Login</h2>
          <p className="text-white/80 mt-2 text-sm">
            Secure access to POS & dashboard
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleLogin} className="p-8 space-y-5">

          <div>
            <label className="block text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg"
          >
            {loading ? "Logging in..." : "Login"}
            {!loading && <ChevronRight size={20} />}
          </button>
        </form>
      </div>
    </div>
  );
}
