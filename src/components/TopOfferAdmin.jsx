import React, { useState, useEffect } from "react";
import axios from "axios";




export default function TopOfferAdmin() {
  const [formData, setFormData] = useState({
    lemonMessage: "",
    whatsappNumber: "",
    welcomeMessage: "",
    leftArrowLabel: "",
    rightArrowLabel: "",
  });
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";


  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/topOffer`);
        if (res.data) {
          setFormData({
            lemonMessage: res.data.lemonMessage || "",
            whatsappNumber: res.data.whatsappNumber || "",
            welcomeMessage: res.data.welcomeMessage || "",
            leftArrowLabel: res.data.leftArrowLabel || "",
            rightArrowLabel: res.data.rightArrowLabel || "",
          });
        }
      } catch (err) {
        console.error("Error fetching offer:", err);
      }
    };

    fetchOffer();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/topOffer`, formData);
      alert("Offer updated!");
    } catch (err) {
      console.error("Error updating offer:", err);
      alert("Failed to update offer");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Banner Preview */}
      <div className="rounded overflow-hidden shadow mb-6">
        <div className="bg-green-600 text-white flex justify-between items-center px-4 py-2 text-sm">
          <span>{formData.lemonMessage || "Pure Lemon. Pure Wellness."}</span>
          <a
            href={`https://wa.me/${formData.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            Need help? Call Us: {formData.whatsappNumber || "+91 80728 12904"}
          </a>
        </div>
        <div className="bg-black text-white flex justify-center items-center gap-4 py-2 text-sm">
          <span>{formData.leftArrowLabel || "←"}</span>
          <span>{formData.welcomeMessage || "Welcome to Vitalimes"}</span>
          <span>{formData.rightArrowLabel || "→"}</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
        <InputField label="Lemon Wellness Message" name="lemonMessage" value={formData.lemonMessage} onChange={handleChange} />
        <InputField label="WhatsApp Number" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} />
        <InputField label="Welcome Message" name="welcomeMessage" value={formData.welcomeMessage} onChange={handleChange} />
        <InputField label="Left Arrow Label" name="leftArrowLabel" value={formData.leftArrowLabel} onChange={handleChange} />
        <InputField label="Right Arrow Label" name="rightArrowLabel" value={formData.rightArrowLabel} onChange={handleChange} />
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">
          Update Offer
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
