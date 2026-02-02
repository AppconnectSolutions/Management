import React, { useState, useEffect } from "react";
import axios from "axios";

const labels = [
  "Pure & Natural Ingredients",
  "Chemical-Free Processing",
  "Cold-Pressed Extraction",
  "Rich Nutrients & Vitamins",
  "Farm-Fresh & Locally Sourced",
  "Sustainable Farming Support",
  "Trusted by 250+ Farmers",
  "Quality Tested & Verified",
];
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";


export default function WhyChooseAdmin() {
  const [companyName, setCompanyName] = useState("");
  const [images, setImages] = useState(labels.map(() => ({ file: null, preview: "" })));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/why-choose`);
        if (res.data) {
          setCompanyName(res.data.company_name || "");
          const updatedImages = labels.map((_, i) => ({
            file: null,
            preview: res.data[`image${i + 1}`] || "",
          }));
          setImages(updatedImages);
        }
      } catch (err) {
        console.error("Error loading data:", err);
      }
    };

    fetchData();
  }, []);

  const handleFileChange = (index, file) => {
    const updated = [...images];
    updated[index].file = file;
    updated[index].preview = URL.createObjectURL(file);
    setImages(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("companyName", companyName);
      images.forEach((img, i) => {
        if (img.file) formData.append(`image${i + 1}`, img.file);
      });

      await axios.post(`${API_URL}/api/why-choose`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Updated successfully!");
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to update");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* ✅ Live Preview */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-center mb-2">
          Why Choose <span className="text-green-700">{companyName || "Vitalimes"}</span>
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {images.map((img, idx) => (
            <div key={idx} className="text-center space-y-2">
              <div className="w-full h-24 flex items-center justify-center border rounded bg-white overflow-hidden">
                {img.preview ? (
                  <img src={img.preview} alt={`Reason ${idx + 1}`} className="h-full object-contain" />
                ) : (
                  <span className="text-sm text-gray-400">No image</span>
                )}
              </div>
              <p className="text-sm font-semibold text-gray-700">{labels[idx]}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ✅ Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-6">
        <div>
          <label className="block font-semibold mb-1">Company Name</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-indigo-500"
            placeholder="Enter company name"
          />
        </div>

        {labels.map((label, idx) => (
          <div key={idx}>
            <label className="block font-semibold mb-1">{label}</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(idx, e.target.files[0])}
              className="w-full p-2 border rounded"
            />
          </div>
        ))}

        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
        >
          Update Section
        </button>
      </form>
    </div>
  );
}
