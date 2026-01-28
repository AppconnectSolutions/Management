import React, { useState } from "react";
import { ArrowLeft, UserPlus, LogIn, ChevronRight, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CustomerLogin({ onLoginSuccess }) {
  const navigate = useNavigate();
   const API_URL = process.env.REACT_APP_API_URL || "https://api.digicopy.in";

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    password: "",
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setFormData({ name: "", mobile: "", email: "", password: "" });
    setError("");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const url = isRegistering
      ? `${API_URL}/api/customers/register`
      : `${API_URL}/api/customers/login`;

    const bodyData = isRegistering
      ? {
          name: formData.name,
          mobile: formData.mobile,
          email: formData.email,
          password: formData.password,
        }
      : {
          mobile: formData.mobile,
          password: formData.password,
        };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Something went wrong");

      alert(data.message || "Success");

      if (!isRegistering) {
        // ✅ Create customer object and pass isDefaultPassword flag
        const customer = {
          ...data.customer,
          pointsBalance: data.customer.points_balance,
          // Mark as default password if forcePasswordChange is true
          isDefaultPassword: data.forcePasswordChange || false,
        };

        // Pass to App.js
        onLoginSuccess(customer, data.transactions || [], data.forcePasswordChange);
        // ✅ Do NOT navigate here, dashboard will handle the popup
      } else {
        toggleMode();
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 text-gray-500 hover:text-gray-800 font-medium text-sm flex items-center gap-1 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Main
      </button>

      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden relative z-10">
        <div
          className={`p-8 text-center relative transition-colors duration-500 ${
            isRegistering ? "bg-purple-600" : "bg-indigo-600"
          }`}
        >
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white">
            {isRegistering ? <UserPlus size={32} /> : <LogIn size={32} />}
          </div>
          <h2 className="text-2xl font-bold text-white">
            {isRegistering ? "Create Account" : "Customer Login"}
          </h2>
          <p className="text-white/80 mt-2 text-sm">
            {isRegistering
              ? "Join now & get 50 Bonus Points!"
              : "Access your loyalty rewards"}
          </p>
        </div>

        <div className="p-8">
          <form onSubmit={handleAuth} className="space-y-5">
            {isRegistering && (
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Mobile Number</label>
              <input
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border"
                required
              />
            </div>

            {isRegistering && (
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border"
                required
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <X size={14} /> {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 ${
                isRegistering ? "bg-purple-600" : "bg-indigo-600"
              }`}
            >
              {isLoading ? "Processing..." : isRegistering ? "Register" : "Login"}
              {!isLoading && <ChevronRight size={18} />}
            </button>

            <div className="text-center">
              <button type="button" onClick={toggleMode} className="text-sm underline">
                {isRegistering
                  ? "Already have an account? Login"
                  : "New Customer? Register Now"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
