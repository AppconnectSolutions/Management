import { useEffect, useState } from "react";
import { ShieldCheck, Plus } from "lucide-react";

export default function RoleManagement() {
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  /* ================= ROLE STATE ================= */
  const [roles, setRoles] = useState([]);
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= USER (ADMIN / STAFF) STATE ================= */
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userRoleId, setUserRoleId] = useState("");

  /* ================= AUTH CHECK ================= */
  const loggedUser = JSON.parse(localStorage.getItem("admin") || "null");

// role_id === 1 → Admin
const isAdmin =
  typeof loggedUser?.role === "string" &&
  ["ADMIN", "OWNER"].includes(loggedUser.role.toUpperCase());



  /* ================= LOAD ROLES ================= */
  const loadRoles = async () => {
    try {
      const res = await fetch(`${API_URL}/api/roles`);
      const data = await res.json();
      setRoles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load roles", err);
      setRoles([]);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  /* ================= ADD ROLE ================= */
  const addRole = async () => {
    if (!roleName.trim()) {
      alert("Role name is required");
      return;
    }

    setLoading(true);
    try {
      await fetch(`${API_URL}/api/roles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role_name: roleName,
          description,
        }),
      });

      setRoleName("");
      setDescription("");
      loadRoles();
    } catch (err) {
      alert("Failed to add role");
    } finally {
      setLoading(false);
    }
  };

  /* ================= ADD ADMIN / STAFF USER ================= */
  const addAdminUser = async () => {
    if (!userEmail || !userPassword || !userRoleId) {
      alert("Name, Email, Password and Role are required");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userName || null,
          email: userEmail,
          password: userPassword,
          role_id: Number(userRoleId),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to create user");
        return;
      }

      alert("User created successfully");

      setUserName("");
      setUserEmail("");
      setUserPassword("");
      setUserRoleId("");
    } catch (err) {
      alert("Server error while creating user");
    }
  };
console.log("loggedUser:", loggedUser);
console.log("isAdmin:", isAdmin);

  /* ================= UI ================= */
  return (
    <div className="p-6 bg-slate-100 min-h-screen">
      {/* HEADER */}
      <div className="bg-slate-900 text-white rounded-xl px-6 py-5 mb-6 flex items-center gap-3">
        <ShieldCheck size={28} />
        <div>
          <h1 className="text-xl font-bold">Role Management</h1>
          <p className="text-xs text-slate-300">
            Create roles and manage staff access
          </p>
        </div>
      </div>

      {/* ================= CREATE USER (ADMIN ONLY) ================= */}
      {isAdmin && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="font-bold mb-4">Create Admin / Staff Login</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              placeholder="Name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="border px-3 py-2 rounded"
            />

            <input
              placeholder="Email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="border px-3 py-2 rounded"
            />

            <input
              type="password"
              placeholder="Password"
              value={userPassword}
              onChange={(e) => setUserPassword(e.target.value)}
              className="border px-3 py-2 rounded"
            />

            <select
              value={userRoleId}
              onChange={(e) => setUserRoleId(e.target.value)}
              className="border px-3 py-2 rounded bg-white"
            >
              <option value="">Select Role</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.role_name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={addAdminUser}
            className="mt-4 bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700"
          >
            Create User
          </button>
        </div>
      )}

      {/* ================= ADD ROLE ================= */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="font-bold mb-4 flex items-center gap-2">
          <Plus size={18} /> Add New Role
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            placeholder="Role Name (Admin, Staff, Teacher)"
            className="border px-3 py-2 rounded"
          />

          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="border px-3 py-2 rounded"
          />
        </div>

        <button
          onClick={addRole}
          disabled={loading}
          className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded font-bold hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Add Role"}
        </button>
      </div>

      {/* ================= ROLES TABLE ================= */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left">Role Name</th>
              <th className="px-6 py-3 text-left">Description</th>
              <th className="px-6 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-6 py-3 font-bold">{r.role_name}</td>
                <td className="px-6 py-3 text-gray-600">
                  {r.description || "-"}
                </td>
                <td className="px-6 py-3 text-center text-green-600 font-bold">
                  Active
                </td>
              </tr>
            ))}

            {roles.length === 0 && (
              <tr>
                <td colSpan="3" className="p-6 text-center text-gray-400">
                  No roles created yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
