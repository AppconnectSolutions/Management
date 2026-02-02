import React, { useState } from "react";
import axios from "axios";
import Carousel from "react-bootstrap/Carousel";
import "bootstrap/dist/css/bootstrap.min.css";

export default function BannerAdmin() {
  const [slides, setSlides] = useState([
    { file: null, preview: "" },
    { file: null, preview: "" },
    { file: null, preview: "" },
    { file: null, preview: "" },
    { file: null, preview: "" },
    { file: null, preview: "" },
  ]);
const API_URL = import.meta.env.VITE_API_URL || "ecommerce-template-templatemanagementbac-5ae226-69-62-74-195.traefik.me";

  const handleFileChange = (index, file) => {
    const updated = [...slides];
    updated[index].file = file;
    updated[index].preview = URL.createObjectURL(file);
    setSlides(updated);
  };

  const handleAddSlide = () => {
    setSlides((prev) => [...prev, { file: null, preview: "" }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      for (const slide of slides) {
        if (!slide.file) continue;
        const formData = new FormData();
        formData.append("slide", slide.file);
        await axios.post(`${API_URL}/api/banner`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      alert("Slides uploaded!");
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload slides");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h2 className="text-xl font-bold mb-4">Banner Management</h2>

      {/* ✅ Live Preview Carousel */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">Live Preview</h3>
        <Carousel fade interval={4000} controls indicators>
          {slides.filter((s) => s.preview).map((s, index) => (
            <Carousel.Item key={index}>
              <div className="relative w-full h-[400px] overflow-hidden">
                <img
                  src={s.preview}
                  alt={`Slide ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
      </div>

      {/* ✅ Upload Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {slides.map((slide, idx) => (
          <div key={idx} className="bg-white p-4 rounded shadow border space-y-2">
            <h3 className="font-semibold">Slide {idx + 1}</h3>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(idx, e.target.files[0])}
              className="w-full p-2 border rounded"
            />
            
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddSlide}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          Add Another Slide
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
        >
          Upload All Slides
        </button>
      </form>
    </div>
  );
}
