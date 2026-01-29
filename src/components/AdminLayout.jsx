import { Outlet, useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminUser"); // ✅ FIXED KEY
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar onLogout={handleLogout} />
      <main className="flex-1 bg-slate-100 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
