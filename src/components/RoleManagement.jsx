import { useEffect, useMemo, useState } from "react";
import {
  ShieldCheck,
  Plus,
  UserPlus,
  UserX,
  RefreshCw,
} from "lucide-react";

function safeParseJSON(v) {
  try {
    return JSON.parse(v || "null");
  } catch {
    return null;
  }
}

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

  /* ================= STAFF LIST STATE ================= */
  const [staffUsers, setStaffUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");

  /* ================= AUTH CHECK ================= */
  const loggedUser = useMemo(
    () => safeParseJSON(localStorage.getItem("adminUser")),
    []
  );

  const role = String(loggedUser?.role || "").toUpperCase();
const isAdmin = role === "ADMIN" || role === "OWNER";

// ✅ staff access controlled by approved flag
const canManage = isAdmin || Number(loggedUser?.approved) === 1;


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

  /* ================= LOAD ADMIN/STAFF USERS =================
     Expected API suggestions (pick what you have):
       1) GET  /api/admin/users
       2) GET  /api/admin/users?status=all
     User object assumed:
       { id, name, email, role_id, role_name, is_active }
  =========================================================== */
  const loadAdminUsers = async () => {
   if (!canManage) return;


    try {
      setUsersLoading(true);
      setUsersError("");

      const res = await fetch(`${API_URL}/api/admin/users`);
      const data = await res.json();

      // allow {users:[...]} or [...]
      const list = Array.isArray(data) ? data : Array.isArray(data?.users) ? data.users : [];
      setStaffUsers(list);
    } catch (err) {
      console.error("Failed to load admin/staff users", err);
      setUsersError("Failed to load users");
      setStaffUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
    if (isAdmin) loadAdminUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

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
        body: JSON.stringify({ role_name: roleName, description }),
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

      // refresh list
      loadAdminUsers();
    } catch (err) {
      alert("Server error while creating user");
    }
  };

  /* ================= ACTIONS: GIVE ACCESS / REMOVE ACCESS =================
     These require backend endpoints. I used common patterns:
       - Give access  : PUT /api/admin/users/:id/activate   (or /grant-access)
       - Remove access: PUT /api/admin/users/:id/deactivate (or /remove-access)
     👉 If your endpoints are different, just change URLs below.
  ======================================================================== */
  const giveAccess = async (id) => {
    if (!isAdmin) return;
    if (!window.confirm("Give access to this user?")) return;

    try {
      setUsersLoading(true);
      const res = await fetch(`${API_URL}/api/admin/users/${id}/activate`, {
        method: "PUT",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to give access");
      await loadAdminUsers();
    } catch (e) {
      alert(e.message || "Failed to give access");
    } finally {
      setUsersLoading(false);
    }
  };

  const removeAccess = async (id) => {
    if (!isAdmin) return;
    if (!window.confirm("Remove access for this user?")) return;

    try {
      setUsersLoading(true);
      const res = await fetch(`${API_URL}/api/admin/users/${id}/deactivate`, {
        method: "PUT",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to remove access");
      await loadAdminUsers();
    } catch (e) {
      alert(e.message || "Failed to remove access");
    } finally {
      setUsersLoading(false);
    }
  };

  const roleNameById = useMemo(() => {
    const m = new Map();
    roles.forEach((r) => m.set(Number(r.id), r.role_name));
    return m;
  }, [roles]);

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

          {/* ================= USERS TABLE (ADMIN/STAFF) ================= */}
          <div className="mt-8">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h3 className="font-bold">Admins / Staff List</h3>
              <button
                onClick={loadAdminUsers}
                className="inline-flex items-center gap-2 text-sm bg-slate-100 px-3 py-2 rounded hover:bg-slate-200"
                disabled={usersLoading}
              >
                <RefreshCw size={16} />
                {usersLoading ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            {usersError ? (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded p-3 mb-3">
                {usersError}
              </div>
            ) : null}

            <div className="bg-white border rounded-xl overflow-hidden">
              <div className="hidden md:block">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left">Name</th>
                      <th className="px-6 py-3 text-left">Email</th>
                      <th className="px-6 py-3 text-left">Role</th>
                      <th className="px-6 py-3 text-center">Status</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {usersLoading ? (
                      <tr>
                        <td colSpan="5" className="p-6 text-center text-gray-500">
                          Loading users...
                        </td>
                      </tr>
                    ) : staffUsers.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-6 text-center text-gray-400">
                          No admin/staff users found
                        </td>
                      </tr>
                    ) : (
                      staffUsers.map((u) => {
                        const active = u.is_active === 1 || u.is_active === true || u.status === "ACTIVE";
                        const rName =
                          u.role_name ||
                          roleNameById.get(Number(u.role_id)) ||
                          "-";

                        return (
                          <tr key={u.id} className="border-t">
                            <td className="px-6 py-3 font-semibold">
                              {u.name || "-"}
                            </td>
                            <td className="px-6 py-3">{u.email || "-"}</td>
                            <td className="px-6 py-3">{rName}</td>
                            <td className="px-6 py-3 text-center">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-bold ${
                                  active
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {active ? "Active" : "Removed"}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-right">
                              <div className="inline-flex gap-2">
                                {!active ? (
                                  <button
                                    onClick={() => giveAccess(u.id)}
                                    className="bg-green-600 text-white px-3 py-1.5 rounded text-xs font-bold inline-flex items-center gap-2"
                                    disabled={usersLoading}
                                  >
                                    <UserPlus size={14} /> Give Access
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => removeAccess(u.id)}
                                    className="bg-red-600 text-white px-3 py-1.5 rounded text-xs font-bold inline-flex items-center gap-2"
                                    disabled={usersLoading}
                                  >
                                    <UserX size={14} /> Remove
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS */}
              <div className="md:hidden divide-y">
                {usersLoading ? (
                  <div className="p-6 text-center text-gray-500 text-sm">
                    Loading users...
                  </div>
                ) : staffUsers.length === 0 ? (
                  <div className="p-6 text-center text-gray-400 text-sm">
                    No admin/staff users found
                  </div>
                ) : (
                  staffUsers.map((u) => {
                    const active = u.is_active === 1 || u.is_active === true || u.status === "ACTIVE";
                    const rName =
                      u.role_name ||
                      roleNameById.get(Number(u.role_id)) ||
                      "-";

                    return (
                      <div key={u.id} className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-bold truncate">{u.name || "-"}</div>
                            <div className="text-sm text-gray-600 break-all">{u.email || "-"}</div>
                            <div className="mt-1 text-xs text-gray-500">{rName}</div>
                          </div>

                          <span
                            className={`shrink-0 px-2 py-1 rounded-full text-xs font-bold ${
                              active
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {active ? "Active" : "Removed"}
                          </span>
                        </div>

                        <div className="mt-3">
                          {!active ? (
                            <button
                              onClick={() => giveAccess(u.id)}
                              className="w-full bg-green-600 text-white px-3 py-2 rounded-lg text-xs font-bold inline-flex items-center justify-center gap-2"
                              disabled={usersLoading}
                            >
                              <UserPlus size={14} /> Give Access
                            </button>
                          ) : (
                            <button
                              onClick={() => removeAccess(u.id)}
                              className="w-full bg-red-600 text-white px-3 py-2 rounded-lg text-xs font-bold inline-flex items-center justify-center gap-2"
                              disabled={usersLoading}
                            >
                              <UserX size={14} /> Remove Access
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <p className="mt-3 text-xs text-gray-500">
              ⚠️ Note: This UI calls <code>/api/admin/users/:id/activate</code> and{" "}
              <code>/api/admin/users/:id/deactivate</code>. If your backend uses
              different endpoints, tell me the exact URLs and I’ll update the code.
            </p>
          </div>
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
                <td className="px-6 py-3 text-gray-600">{r.description || "-"}</td>
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
