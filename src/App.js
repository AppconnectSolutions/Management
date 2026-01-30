import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminSidebar from "./components/AdminSidebar";
import TopOfferAdmin from "./components/TopOfferAdmin";
import NavbarAdmin from "./components/NavbarAdmin";
import BannerAdmin from "./components/BannerAdmin";
import WhyChooseAdmin from "./components/WhyChooseAdmin";
import TopPicksAdmin from "./components/TopPicksAdmin";

function App() {
  return (
    <Router>
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/admin/top-offer" element={<TopOfferAdmin />} />
            <Route path="/admin/navbar" element={<NavbarAdmin />} />
            <Route path="/admin/banner" element={<BannerAdmin />} />
            <Route path="/admin/why-choose" element={<WhyChooseAdmin />} />
            <Route path="/admin/top-picks" element={<TopPicksAdmin />} />

            {/* other routes */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
