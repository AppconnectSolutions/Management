import { Link, useLocation } from "react-router-dom";
import {
  ShoppingCart,
  LayoutGrid,
  Package,
  Users,
  Tag,
  Megaphone,
  ShieldCheck,
  LogOut,
} from "lucide-react";

export default function AdminSidebar({ onLogout }) {
  const location = useLocation();

  const sidebarItems = [
    { icon: <ShoppingCart size={22} />, label: "Top Content", path: "/admin/top-offer" },
    { icon: <LayoutGrid size={22} />, label: "Navbar", path: "/admin/navbar" },
    { icon: <Package size={22} />, label: "Banner", path: "/admin/banner" },
    { icon: <Users size={22} />, label: "Why Choose", path: "/admin/why-choose" },
    { icon: <Tag size={22} />, label: "Top Picks", path: "/admin/top-picks" },
    { icon: <Megaphone size={22} />, label: "Recipes", path: "/admin/recipes" },
    { icon: <ShieldCheck size={22} />, label: "Daily Best Sales", path: "/admin/daily-sales" },
  ];

  return (
    <aside className="w-20 lg:w-64 h-screen sticky top-0 bg-gradient-to-b from-indigo-900 via-purple-900 to-slate-900 text-white flex flex-col shadow-2xl">

      {/* Brand */}
      <div className="p-4 lg:p-6 flex items-center gap-3 border-b border-white/10">
        <div className="w-10 h-10 bg-gradient-to-tr from-pink-500 to-indigo-500 rounded-xl flex items-center justify-center font-bold">
          AC
        </div>

        <div className="hidden lg:block">
          <span className="text-lg font-bold">Template Management</span>
          <span className="text-xs text-gray-300 block">
            Appconnectsolutions
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 lg:p-4 space-y-2 overflow-y-auto">
        {sidebarItems.map((item, idx) => {
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={idx}
              to={item.path}
              className={`no-underline flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200
              ${
                isActive
                  ? "bg-white/20 text-white shadow-md"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.icon}
              <span className="hidden lg:block font-medium">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div
        onClick={onLogout}
        className="flex items-center gap-3 px-4 py-3 m-2 rounded-xl cursor-pointer bg-white/5 hover:bg-red-600 transition-all duration-200"
      >
        <LogOut size={20} />
        <span className="hidden lg:block font-semibold">Logout</span>
      </div>
    </aside>
  );
}