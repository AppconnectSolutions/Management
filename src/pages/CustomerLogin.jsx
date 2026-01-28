import React, { useState } from "react";
import { ArrowLeft, UserPlus, LogIn, ChevronRight, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CustomerLogin({ onLoginSuccess }) {
  const navigate = useNavigate();
  const API_URL =
    process.env.REACT_APP_API_URL || "https://api.digicopy.in";

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    password: "",
  });

  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔐 Forgot password states
  const [showForgot, setShowForgot] = useState(false);
  const [forgotMobile, setForgotMobile] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setFormData({ name: "", mobile: "", email: "", password: "" });
    setError("");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /* ---------------- LOGIN / REGISTER ---------------- */
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
      if (!res.ok) throw new Error(data.message || "Login failed");

      if (!isRegistering) {
        onLoginSuccess(data.customer, data.transactions || []);
      } else {
        toggleMode();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------- RESET PASSWORD (NO OTP) ---------------- */
  const handleResetPassword = async () => {
    setForgotMsg("");

    if (!forgotMobile || !newPassword || !confirmPassword) {
      setForgotMsg("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setForgotMsg("Passwords do not match");
      return;
    }

    try {
      setIsLoading(true);

      const res = await fetch(
        `${API_URL}/api/customers/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mobile: forgotMobile,
            newPassword,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");

      alert("Password updated successfully. Please login.");

      // reset modal
      setShowForgot(false);
      setForgotMobile("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e) {
      setForgotMsg(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 relative">
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 text-gray-500 hover:text-gray-800 flex items-center gap-1"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className={`p-8 text-center ${isRegistering ? "bg-purple-600" : "bg-indigo-600"}`}>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white">
            {isRegistering ? <UserPlus size={32} /> : <LogIn size={32} />}
          </div>
          <h2 className="text-2xl font-bold text-white">
            {isRegistering ? "Create Account" : "Customer Login"}
          </h2>
        </div>

        <div className="p-8">
          <form onSubmit={handleAuth} className="space-y-4">
            <input
              name="mobile"
              placeholder="Mobile Number"
              value={formData.mobile}
              onChange={handleChange}
              className="w-full border px-4 py-3 rounded-xl"
              required
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border px-4 py-3 rounded-xl"
              required
            />

            {!isRegistering && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-sm text-indigo-600 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold"
            >
              {isLoading ? "Processing..." : "Login"}
            </button>
          </form>
        </div>
      </div>

      {/* RESET PASSWORD MODAL */}
      {showForgot && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm">
            <h3 className="font-bold text-lg mb-3">Reset Password</h3>

            <input
              placeholder="Registered Mobile"
              value={forgotMobile}
              onChange={(e) => setForgotMobile(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-2"
            />

            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-2"
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-2"
            />

            {forgotMsg && (
              <p className="text-sm text-red-600 mb-2">{forgotMsg}</p>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleResetPassword}
                className="flex-1 bg-indigo-600 text-white py-2 rounded"
              >
                Update
              </button>
              <button
                onClick={() => setShowForgot(false)}
                className="flex-1 bg-gray-300 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
