import {
  ShoppingCart,
  LayoutGrid,
  Package,
  Users,
  Tag,
  Megaphone,
  LogOut,
} from "lucide-react";
import { ShieldCheck } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function AdminSidebar({ onLogout }) {
  /* ================= ROUTER ================= */
  const navigate = useNavigate();
  const location = useLocation();

  /* ================= AUTH USER (FIXED) ================= */
  const loggedUser = JSON.parse(localStorage.getItem("adminUser") || "null");
  const userEmail = loggedUser?.email || "Unknown User";
  const userRole = loggedUser ? loggedUser.role : "—";

  /* ================= SIDEBAR ITEMS ================= */
  const sidebarItems = [
    { icon: <ShoppingCart size={22} />, label: "New Bill", path: "/admin/pos" },
    { icon: <LayoutGrid size={22} />, label: "Owner Dashboard", path: "/admin/dashboard" },
    { icon: <Package size={22} />, label: "Product Manager", path: "/admin/products" },
    { icon: <Users size={22} />, label: "Customer List", path: "/admin/customers" },
    { icon: <Tag size={22} />, label: "Offer Management", path: "/admin/offers" },
    { icon: <Megaphone size={22} />, label: "Promotions", path: "/admin/promotions" },
    { icon: <ShieldCheck size={22} />, label: "Role Management", path: "/admin/roles" },
  ];

  return (
    <aside className="w-20 lg:w-64 bg-slate-900 text-white flex flex-col shadow-xl">
      
      {/* BRAND */}
      <div className="p-4 lg:p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold">
          KB
        </div>
        <div className="hidden lg:block">
          <span className="text-lg font-bold">K.B. Online</span>
          <span className="text-[10px] text-slate-400 font-bold block">
            DIGI-COPY SYSTEM
          </span>
        </div>
      </div>

      {/* NAV */}
      <nav className="flex-1 p-2 lg:p-4 space-y-2">
        {sidebarItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {item.icon}
              <span className="hidden lg:block">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* USER + LOGOUT */}
      <div className="p-4 border-t border-slate-800">
        <div className="hidden lg:block bg-slate-800 rounded-xl p-3 mb-3">
          <p className="text-xs text-slate-400 truncate">{userEmail}</p>
          <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-600/20 text-indigo-400">
            {userRole}
          </span>
        </div>

        <div
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 hover:text-red-400 rounded-xl cursor-pointer"
        >
          <LogOut size={20} />
          <span className="hidden lg:block font-bold">Logout</span>
        </div>
      </div>
    </aside>
  );
}
