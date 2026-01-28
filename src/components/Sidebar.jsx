import { ShoppingCart, LayoutGrid, Users, Package, LogOut } from 'lucide-react';

export default function Sidebar({ onLogout }) {
  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col">
      <div className="p-6 font-bold">K.B. Online</div>

      <nav className="flex-1 space-y-2 p-4">
        <a href="/staff/pos">POS</a>
        <a href="/staff/dashboard">Dashboard</a>
        <a href="/staff/products">Products</a>
        <a href="/staff/customers">Customers</a>
      </nav>

      <button onClick={onLogout} className="p-4 text-red-400 flex items-center gap-2">
        <LogOut /> Logout
      </button>
    </aside>
  );
}
