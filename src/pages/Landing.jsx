import { Store, UserCheck, Shield } from 'lucide-react';
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  const onStaff = () => {
    navigate("/admin");  // Admin login page route
  };

  const onCustomer = () => {
    navigate("/customer");  // Customer login page route
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex items-center justify-center p-4 lg:p-12 relative overflow-hidden font-sans">
      {/* Background glow blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[100px]" />

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 z-10 items-center">

        {/* LEFT BRAND SECTION */}
        <div className="text-white space-y-8 animate-in slide-in-from-left duration-700">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/20 text-yellow-300 text-xs font-bold border border-yellow-400/30 mb-4">
              <Store size={14} />
              One Stop Digital Services
            </div>

            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-none mb-4">
              K.B.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                Online World
              </span>
            </h1>

            <p className="text-xl text-slate-300 max-w-md leading-relaxed">
              Digital Seva, Printing, and Tech Solutions center. Your trusted
              partner for online applications and security systems.
            </p>
          </div>
        </div>

        {/* RIGHT LOGIN CARD */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl animate-in slide-in-from-right duration-700">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Select Login Portal
          </h2>

          <div className="space-y-4">

            {/* STAFF LOGIN */}
            <button
              onClick={onStaff}
              className="w-full group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 p-1 rounded-2xl transition-all shadow-lg shadow-indigo-500/25"
            >
              <div className="bg-slate-900/50 h-full w-full rounded-xl p-6 flex items-center justify-between group-hover:bg-transparent transition-all">
                <div className="text-left">
                  <h3 className="text-lg font-bold text-white">
                    Owner / Staff Login
                  </h3>
                  <p className="text-sm text-indigo-200">
                    Manage Prices & Billing
                  </p>
                </div>

                <div className="bg-white/20 p-3 rounded-full text-white">
                  <Store size={24} />
                </div>
              </div>
            </button>

            {/* CUSTOMER LOGIN */}
            <button
              onClick={onCustomer}
              className="w-full group bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 p-1 rounded-2xl transition-all shadow-lg shadow-teal-500/25"
            >
              <div className="bg-slate-900/50 h-full w-full rounded-xl p-6 flex items-center justify-between group-hover:bg-transparent transition-all">
                <div className="text-left">
                  <h3 className="text-lg font-bold text-white">
                    Customer Login
                  </h3>
                  <p className="text-sm text-teal-200">
                    Check Points & History
                  </p>
                </div>

                <div className="bg-white/20 p-3 rounded-full text-white">
                  <UserCheck size={24} />
                </div>
              </div>
            </button>
          </div>

          {/* FOOTER */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
              Authorized Partner
            </p>
            <div className="flex items-center justify-center gap-2 mt-2 text-white font-bold text-sm">
              <Shield size={16} className="text-red-400" />
              A.S Security System
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
