import { Link } from "react-router-dom";
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
    <aside className="w-20 lg:w-64 bg-gray-800 text-white flex flex-col shadow-lg">
      {/* Brand */}
      <div className="p-4 lg:p-6 flex items-center gap-3 border-b border-gray-700">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold">
          AC
        </div>
        <div className="hidden lg:block">
          <span className="text-lg font-bold">Template Management</span>
          <span className="text-[10px] text-gray-400 font-bold block">
            Appconnectsolutions
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 lg:p-4 space-y-2 overflow-y-auto">
        {sidebarItems.map((item, idx) => (
          <Link
            key={idx}
            to={item.path}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-200 hover:bg-gray-700 hover:text-white cursor-pointer transition-colors duration-200"
          >
            {item.icon}
            <span className="hidden lg:block">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div
        onClick={onLogout}
        className="flex items-center gap-3 px-4 py-3 hover:bg-red-600 hover:text-white rounded-xl cursor-pointer transition-colors duration-200"
      >
        <LogOut size={20} />
        <span className="hidden lg:block font-bold">Logout</span>
      </div>
    </aside>
  );
}
