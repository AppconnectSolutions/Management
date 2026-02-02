import React, { useState, useEffect } from "react";
import axios from "axios";



export default function NavbarAdmin() {
  const [formData, setFormData] = useState({
    logoFile: null,
    companyName: "",
    label1: "Home",
    label2: "Products",
    label3: "Shop Now",
    label4: "About Us",
    label5: "Contact Us",
    label6: "Combos",
  });
 
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const [logoPreview, setLogoPreview] = useState("");

  useEffect(() => {
    const fetchNavbar = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/navbar`);
        if (res.data) {
          setFormData({
            logoFile: null,
            companyName: res.data.companyName || "",
            label1: res.data.label1 || "Home",
            label2: res.data.label2 || "Products",
            label3: res.data.label3 || "Shop Now",
            label4: res.data.label4 || "About Us",
            label5: res.data.label5 || "Contact Us",
            label6: res.data.label6 || "Combos",
          });
          setLogoPreview(res.data.logoUrl || "/assets/images/vita_logo.svg");
        }
      } catch (err) {
        console.error("Error loading navbar:", err);
      }
    };

    fetchNavbar();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, logoFile: file }));
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      if (formData.logoFile) {
        formDataToSend.append("logo", formData.logoFile);
      }
      formDataToSend.append("companyName", formData.companyName);
      formDataToSend.append("label1", formData.label1);
      formDataToSend.append("label2", formData.label2);
      formDataToSend.append("label3", formData.label3);
      formDataToSend.append("label4", formData.label4);
      formDataToSend.append("label5", formData.label5);
      formDataToSend.append("label6", formData.label6);

      await axios.post(`${API_URL}/api/navbar`, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Navbar updated!");
    } catch (err) {
      console.error("Error updating navbar:", err);
      alert("Failed to update navbar");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* ✅ Live Navbar Preview */}
      <div className="bg-white shadow mb-6 border rounded">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo + Company Name */}
          <div className="flex items-center gap-3">
            {logoPreview && (
              <img
                src={logoPreview}
                alt="Logo"
                className="w-16 h-auto object-contain"
              />
            )}
            <span className="text-2xl font-extrabold font-[Poppins]">
              <span className="text-green-700">
                {formData.companyName?.slice(0, 4) || "Vita"}
              </span>
              <span className="text-yellow-500">
                {formData.companyName?.slice(4) || "limes"}
              </span>
            </span>
          </div>

          {/* Navigation Links */}
          <ul className="hidden md:flex gap-6 text-sm font-semibold items-center">
            <li>{formData.label1}</li>
            <li>{formData.label2}</li>
            <li>
              <button className="bg-yellow-400 text-green-900 px-3 py-1 rounded font-bold">
                {formData.label3}
              </button>
            </li>
            <li>{formData.label4}</li>
            <li>{formData.label5}</li>
            <li>{formData.label6}</li>
          </ul>
        </div>
      </div>

      {/* ✅ Form */}
      <h2 className="text-xl font-bold mb-4">Navbar Management</h2>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow space-y-4"
        encType="multipart/form-data"
      >
        <div>
          <label className="block font-semibold mb-1">Logo Upload</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-indigo-500"
          />
        </div>
        <InputField label="Company Name" name="companyName" value={formData.companyName} onChange={handleChange} />
        <InputField label="Label 1" name="label1" value={formData.label1} onChange={handleChange} />
        <InputField label="Label 2" name="label2" value={formData.label2} onChange={handleChange} />
        <InputField label="Label 3" name="label3" value={formData.label3} onChange={handleChange} />
        <InputField label="Label 4" name="label4" value={formData.label4} onChange={handleChange} />
        <InputField label="Label 5" name="label5" value={formData.label5} onChange={handleChange} />
        <InputField label="Label 6" name="label6" value={formData.label6} onChange={handleChange} />
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
        >
          Update Navbar
        </button>
      </form>
    </div>
  );
}

function InputField({ label, name, value, onChange }) {
  return (
    <div>
      <label className="block font-semibold mb-1">{label}</label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-indigo-500"
        placeholder={`Enter ${label.toLowerCase()}`}
      />
    </div>
  );
}
