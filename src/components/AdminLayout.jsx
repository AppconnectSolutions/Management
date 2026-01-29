import { Outlet, useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("admin");
    navigate("/admin/login");
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
