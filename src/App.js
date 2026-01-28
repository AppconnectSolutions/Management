import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useState } from "react";

import Landing from "./pages/Landing";
import StaffLayout from "./layouts/StaffLayout";


import Dashboard from "./components/Dashboard";
import ProductManager from "./components/ProductManager";
import CustomerPortal from "./components/CustomerDashboard";
import CustomerLogin from "./pages/CustomerLogin";
import AdminLogin from "./pages/AdminLogin";
import CustomerDashboard from "./components/CustomerDashboard";
import AdminDashboard from "./components/AdminDashboard";
import Offers from "./components/Offers";
import AdminCustomerTransactions from "./components/AdminCustomerTransactions";

import ChangePassword from "./components/ChangePassword";

function App() {
  const [loggedInCustomer, setLoggedInCustomer] = useState(null);
  const [customerTransactions, setCustomerTransactions] = useState([]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Landing */}
        <Route path="/" element={<LandingWrapper />} />

        {/* Customer routes */}
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

        {/* Admin routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <AdminDashboard
              customers={[]} 
              products={[]} 
              transactions={[]} 
            />
          }
        />
<Route
        path="/admin/offers"
        element={<Offers />} // ✅ Add offers here
      />
      {/* ✅ ADMIN → CUSTOMER TRANSACTIONS (ADD THIS) */}
<Route
  path="/admin/customers/:mobile/transactions"
  element={<AdminCustomerTransactions />}
/>
        {/* Staff routes */}
        <Route path="/staff" element={<StaffWrapper />}>
          
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<ProductManager />} />
          <Route path="customers" element={<CustomerPortal />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function LandingWrapper() {
  const nav = useNavigate();
  return (
    <Landing
      onStaff={() => nav("/staff/pos")}
      onCustomer={() => nav("/customer")}
    />
  );
}

function StaffWrapper() {
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
                // Redirect to change-password page
                navigate("/customer/change-password", { state: { customerId: customer.id } });
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
            <p>Please login first.</p>
          )
        }
      />
      {/* ✅ Pass loggedInCustomer prop here */}
      <Route
        path="change-password"
        element={<ChangePassword loggedInCustomer={loggedInCustomer} />}
      />
    </Routes>
  );
}
export default App;
