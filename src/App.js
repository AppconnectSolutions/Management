import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { useState } from "react";

import Landing from "./pages/Landing";
import StaffLayout from "./layouts/StaffLayout";
import AdminLayout from "./components/AdminLayout";

import Dashboard from "./components/Dashboard";
import ProductManager from "./components/ProductManager";
import CustomerDashboard from "./components/CustomerDashboard";
import CustomerList from "./components/CustomerList";
import CustomerLogin from "./pages/CustomerLogin";
import AdminLogin from "./pages/AdminLogin";
import Offers from "./components/Offers";
import Promotions from "./components/Promotions";
import RoleManagement from "./components/RoleManagement";
import AdminCustomerTransactions from "./components/AdminCustomerTransactions";
import ChangePassword from "./components/ChangePassword";
import Services from "./components/Services";

/* ============================
   PROTECTED ADMIN ROUTE
============================ */
function ProtectedAdminRoute({ adminUser }) {
  if (!adminUser) {
    return <Navigate to="/admin/login" replace />;
  }
  return <AdminLayout />;
}

function App() {
  const [loggedInCustomer, setLoggedInCustomer] = useState(null);
  const [customerTransactions, setCustomerTransactions] = useState([]);

  const [adminUser, setAdminUser] = useState(() => {
    const saved = localStorage.getItem("adminUser");
    return saved ? JSON.parse(saved) : null;
  });

  return (
    <BrowserRouter>
      <Routes>
        {/* ============ LANDING ============ */}
        <Route path="/" element={<LandingWrapper />} />

        {/* ============ CUSTOMER ============ */}
        <Route
          path="/customer/*"
          element={
            <CustomerRoutes
              loggedInCustomer={loggedInCustomer}
              setLoggedInCustomer={setLoggedInCustomer}
              customerTransactions={customerTransactions}
              setCustomerTransactions={setCustomerTransactions}
            />
          }
        />

        {/* ============ ADMIN LOGIN (PUBLIC) ============ */}
        <Route
          path="/admin/login"
          element={<AdminLogin onLoginSuccess={setAdminUser} />}
        />

        {/* ============ ADMIN (PROTECTED) ============ */}
        <Route
          path="/admin"
          element={<ProtectedAdminRoute adminUser={adminUser} />}
        >
          <Route index element={<Navigate to="dashboard" />} />

          <Route path="dashboard" element={<Dashboard />} />
          <Route path="pos" element={<Services />} />
          <Route path="products" element={<ProductManager />} />
          <Route path="customers" element={<CustomerList />} />
          <Route path="offers" element={<Offers />} />
          <Route path="promotions" element={<Promotions />} />
          <Route path="roles" element={<RoleManagement />} />

          <Route
            path="customers/:mobile/transactions"
            element={<AdminCustomerTransactions />}
          />
        </Route>

        {/* ============ STAFF ============ */}
        <Route path="/staff/*" element={<StaffLayoutWrapper />} />
      </Routes>
    </BrowserRouter>
  );
}

/* ============================
   LANDING WRAPPER
============================ */
function LandingWrapper() {
  const nav = useNavigate();
  return (
    <Landing
      onStaff={() => nav("/admin/login")}
      onCustomer={() => nav("/customer")}
    />
  );
}

/* ============================
   STAFF LAYOUT
============================ */
function StaffLayoutWrapper() {
  const nav = useNavigate();
  return (
    <StaffLayout onLogout={() => nav("/")}>
      <Routes>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<ProductManager />} />
        <Route path="customers" element={<CustomerDashboard />} />
      </Routes>
    </StaffLayout>
  );
}

/* ============================
   CUSTOMER ROUTES
============================ */
function CustomerRoutes({
  loggedInCustomer,
  setLoggedInCustomer,
  customerTransactions,
  setCustomerTransactions,
}) {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route
        index
        element={
          <CustomerLogin
            onLoginSuccess={(customer, transactions, forcePasswordChange) => {
              setLoggedInCustomer(customer);
              setCustomerTransactions(transactions || []);

              if (forcePasswordChange) {
                navigate("/customer/change-password", {
                  state: { customerId: customer.id },
                });
              } else {
                navigate("/customer/dashboard");
              }
            }}
          />
        }
      />

      <Route
        path="dashboard"
        element={
          loggedInCustomer ? (
            <CustomerDashboard
              loggedInCustomer={loggedInCustomer}
              myTransactions={customerTransactions}
              onLogout={() => {
                setLoggedInCustomer(null);
                navigate("/customer");
              }}
            />
          ) : (
            <Navigate to="/customer" />
          )
        }
      />

      <Route
        path="change-password"
        element={<ChangePassword loggedInCustomer={loggedInCustomer} />}
      />
    </Routes>
  );
}

export default App;
