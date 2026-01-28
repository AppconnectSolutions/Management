import React, { useState } from "react"; // ✅ import useState
import { useNavigate } from "react-router-dom"; // ✅ import useNavigate

export default function ChangePassword({ loggedInCustomer }) {
  const navigate = useNavigate();
  const customerId = loggedInCustomer?.id; // ✅ get ID from prop

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!customerId) {
      setError("Customer not found. Please login again.");
      return;
    }
    setError("");
    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/customers/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error updating password");

      alert("Password updated successfully!");
      navigate("/customer/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold mb-4">Change Password</h2>
        <input
          type="password"
          placeholder="New Password"
          className="w-full p-3 mb-3 rounded border"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm Password"
          className="w-full p-3 mb-3 rounded border"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <button
          onClick={handleChangePassword}
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 rounded font-bold hover:bg-indigo-700"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </div>
    </div>
  );
}
