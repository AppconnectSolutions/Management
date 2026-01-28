import Sidebar from '../components/Sidebar';

export default function StaffLayout({ children, onLogout }) {
  return (
    <div className="flex h-screen">
      <Sidebar onLogout={onLogout} />
      <main className="flex-1 bg-slate-100 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
