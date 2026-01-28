import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import Dashboard from "./Dashboard";
import ProductManager from "./ProductManager";
import CustomerList from "./CustomerList";
import Services from "./Services";
import Offers from "./Offers";
import Promotions from "./Promotions";
import RoleManagement from "./RoleManagement"; // ✅ NEW

export default function AdminDashboard({ customers, products, transactions }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [productList, setProductList] = useState(products || []);
  const [sentSmsId, setSentSmsId] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("admin");
    window.location.href = "/";
  };

  const calculateRemaining = (count) => 1000 - (count % 1000);

  const sendReminder = (customer) => {
    setSentSmsId(customer.id);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      <main className="flex-1 relative overflow-hidden bg-slate-100/50">
        <div className="h-full overflow-y-auto">

          {activeTab === "dashboard" && (
            <Dashboard
              customers={customers || []}
              transactions={transactions || []}
              products={productList}
              initialTab="overview"
            />
          )}

          {activeTab === "products" && (
            <ProductManager
              products={productList}
              setProducts={setProductList}
            />
          )}

          {activeTab === "customers" && (
            <CustomerList
              customers={customers || []}
              calculateRemaining={calculateRemaining}
              sendReminder={sendReminder}
              sentSmsId={sentSmsId}
            />
          )}

          {activeTab === "pos" && (
            <Services
              products={productList}
              customers={customers || []}
              transactions={transactions || []}
            />
          )}

          {activeTab === "offers" && <Offers />}

          {activeTab === "promotions" && <Promotions />}

          {/* ✅ ROLE MANAGEMENT */}
          {activeTab === "roles" && <RoleManagement />}

        </div>
      </main>
    </div>
  );
}
