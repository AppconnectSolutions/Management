import AdminSidebar from "./AdminSidebar";

export default function AdminLayout() {
  const handleLogout = () => {
    // Optional: just log for now
    console.log("Logout clicked");
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar onLogout={handleLogout} />
      <main className="flex-1 bg-slate-100 overflow-y-auto p-4">
        {/* Main content placeholder */}
        <h1 className="text-xl font-bold text-gray-700">Main Content Here</h1>
      </main>
    </div>
  );
}
