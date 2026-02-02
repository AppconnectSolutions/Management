import React, { useState, useEffect } from "react";
import axios from "axios";

export default function DailyBestAdmin() {
  const [hero, setHero] = useState({ title: "", description: "", ctaLabel: "", image: null, preview: "" });
  const [products, setProducts] = useState([
    { title: "", description: "", rating: "", ctaLabel: "", image: null, preview: "" },
    { title: "", description: "", rating: "", ctaLabel: "", image: null, preview: "" },
    { title: "", description: "", rating: "", ctaLabel: "", image: null, preview: "" },
    { title: "", description: "", rating: "", ctaLabel: "", image: null, preview: "" },
    { title: "", description: "", rating: "", ctaLabel: "", image: null, preview: "" },
    { title: "", description: "", rating: "", ctaLabel: "", image: null, preview: "" },
  ]);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";


  // Fetch existing hero + products
  useEffect(() => {
    const fetchData = async () => {
      const heroRes = await axios.get(`${API_URL}/api/daily-best/hero`);
      if (heroRes.data) setHero({ ...heroRes.data, preview: heroRes.data.image_url });

      const prodRes = await axios.get(`${API_URL}/api/daily-best/products`);
      if (prodRes.data.length > 0) setProducts(prodRes.data.map(p => ({ ...p, preview: p.image_url })));
    };
    fetchData();
  }, []);

  // Hero handlers
  const handleHeroChange = (e) => setHero({ ...hero, [e.target.name]: e.target.value });
  const handleHeroImage = (e) => {
    const file = e.target.files[0];
    if (file) setHero({ ...hero, image: file, preview: URL.createObjectURL(file) });
  };
  const submitHero = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("title", hero.title);
    fd.append("description", hero.description);
    fd.append("ctaLabel", hero.ctaLabel);
    if (hero.image) fd.append("image", hero.image);
    await axios.post(`${API_URL}/api/daily-best/hero`, fd);
    alert("Hero saved");
  };

  // Product handlers
  const handleProductChange = (i, field, value) => {
    const updated = [...products];
    updated[i][field] = value;
    setProducts(updated);
  };
  const handleProductImage = (i, file) => {
    const updated = [...products];
    updated[i].image = file;
    updated[i].preview = URL.createObjectURL(file);
    setProducts(updated);
  };
  const addProduct = () => setProducts([...products, { title: "", description: "", rating: "", ctaLabel: "", image: null, preview: "" }]);
  const submitProducts = async (e) => {
    e.preventDefault();
    for (const p of products) {
      const fd = new FormData();
      fd.append("title", p.title);
      fd.append("description", p.description);
      fd.append("rating", p.rating);
      fd.append("ctaLabel", p.ctaLabel);
      if (p.image) fd.append("image", p.image);
      await axios.post(`${API_URL}/api/daily-best/products`, fd);
    }
    alert("Products saved");
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10">
      {/* ✅ Hero Form */}
      <form onSubmit={submitHero} className="bg-white p-6 rounded shadow space-y-4">
        <h2 className="text-xl font-bold">Daily Best Hero</h2>
        {hero.preview && <img src={hero.preview} alt="Hero Preview" className="w-full h-64 object-contain rounded" />}
        <input name="title" value={hero.title} onChange={handleHeroChange} placeholder="Title" className="w-full border p-2 rounded" />
        <textarea name="description" value={hero.description} onChange={handleHeroChange} placeholder="Description" className="w-full border p-2 rounded" />
        <input name="ctaLabel" value={hero.ctaLabel} onChange={handleHeroChange} placeholder="CTA Label" className="w-full border p-2 rounded" />
        <input type="file" onChange={(e) => handleHeroImage(e)} className="w-full border p-2 rounded" />
        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Save Hero</button>
      </form>

      {/* ✅ Products Form */}
      <form onSubmit={submitProducts} className="bg-white p-6 rounded shadow space-y-6">
        <h2 className="text-xl font-bold">Daily Best Products</h2>
        {products.map((p, i) => (
          <div key={i} className="border p-4 rounded space-y-2">
            <h4 className="font-semibold">Product {i + 1}</h4>
            {p.preview && <img src={p.preview} alt={`Preview ${i + 1}`} className="w-full h-40 object-contain rounded" />}
            <input value={p.title} onChange={(e) => handleProductChange(i, "title", e.target.value)} placeholder="Title" className="w-full border p-2 rounded" />
                     
             <textarea
              value={p.description}
              onChange={(e) => handleProductChange(i, "description", e.target.value)}
              placeholder="Description"
              className="w-full border p-2 rounded"
            />
            <input
              type="number"
              step="0.1"
              value={p.rating}
              onChange={(e) => handleProductChange(i, "rating", e.target.value)}
              placeholder="Rating (e.g. 4.5)"
              className="w-full border p-2 rounded"
            />
            <input
              type="text"
              value={p.ctaLabel}
              onChange={(e) => handleProductChange(i, "ctaLabel", e.target.value)}
              placeholder="CTA Label (e.g. Add to Cart)"
              className="w-full border p-2 rounded"
            />
            <input
              type="file"
              onChange={(e) => handleProductImage(i, e.target.files[0])}
              className="w-full border p-2 rounded"
            />
          </div>
        ))}

        {/* Add More Button */}
        <button
          type="button"
          onClick={addProduct}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Add More Product
        </button>

        {/* Save All Products */}
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded ml-4"
        >
          Save Products
        </button>
      </form>
    </div>
  );
}