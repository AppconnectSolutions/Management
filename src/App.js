import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useState } from "react";

import Landing from "./pages/Landing";
import StaffLayout from "./layouts/StaffLayout";
import AdminLayout from "./components/AdminLayout";
import Promotions from "./components/Promotions";
import RoleManagement from "./components/RoleManagement";
import Dashboard from "./components/Dashboard";
import ProductManager from "./components/ProductManager";
import CustomerPortal from "./components/CustomerDashboard";
import CustomerDashboard from "./components/CustomerDashboard";
 import CustomerList from "./components/CustomerList";
import CustomerLogin from "./pages/CustomerLogin";
import AdminLogin from "./pages/AdminLogin";
import Offers from "./components/Offers";
import AdminCustomerTransactions from "./components/AdminCustomerTransactions";
import ChangePassword from "./components/ChangePassword";
import Services from "./components/Services";


function App() {
  const [loggedInCustomer, setLoggedInCustomer] = useState(null);
  const [customerTransactions, setCustomerTransactions] = useState([]);

  return (
    <BrowserRouter>
      <Routes>

        {/* LANDING */}
        <Route path="/" element={<LandingWrapper />} />

        {/* CUSTOMER */}
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

        {/* ADMIN LOGIN */}
      <Route path="/admin/login" element={<AdminLogin />} />

<Route path="/admin" element={<AdminLayout />}>
  <Route index element={<Navigate to="dashboard" />} />

  <Route path="dashboard" element={<Dashboard />} />
  <Route path="pos" element={<Services />} />
  <Route path="products" element={<ProductManager />} />
  <Route path="customers" element={<CustomerList />} />
  <Route path="offers" element={<Offers />} />
  <Route path="promotions" element={<Promotions />} /> 
  <Route path="roles" element={<RoleManagement />} />
  {/* ✅ FIX */}
  <Route
    path="customers/:mobile/transactions"
    element={<AdminCustomerTransactions />}
  />
</Route>



        {/* STAFF AREA */}
        <Route path="/staff" element={<StaffLayoutWrapper />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<ProductManager />} />
          <Route path="customers" element={<CustomerDashboard />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

/* ---------------- LANDING ---------------- */
function LandingWrapper() {
  const nav = useNavigate();
  return (
    <Landing
      onStaff={() => nav("/staff/dashboard")}
      onCustomer={() => nav("/customer")}
    />
  );
}

/* ---------------- STAFF LAYOUT ---------------- */
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

/* ---------------- CUSTOMER ROUTES ---------------- */
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
