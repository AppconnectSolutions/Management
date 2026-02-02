import React, { useState } from "react";
import axios from "axios";

export default function TopPicksAdmin() {
  const [hero, setHero] = useState({
    title: "",
    description: "",
    buttonLabel: "",
    image: null,
    preview: "",
  });
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";


  const [products, setProducts] = useState(
    Array(4).fill().map(() => ({
      title: "",
      price: "",
      oldPrice: "",
      rating: "",
      badge: "",
      image: null,
      preview: "",
    }))
  );

  const handleHeroChange = (e) => {
    setHero({ ...hero, [e.target.name]: e.target.value });
  };

  const handleHeroImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setHero({ ...hero, image: file, preview: URL.createObjectURL(file) });
    }
  };

  const handleProductChange = (index, field, value) => {
    const updated = [...products];
    updated[index][field] = value;
    setProducts(updated);
  };

  const handleProductImage = (index, file) => {
    const updated = [...products];
    updated[index].image = file;
    updated[index].preview = URL.createObjectURL(file);
    setProducts(updated);
  };

  const submitHero = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", hero.title);
    formData.append("description", hero.description);
    formData.append("buttonLabel", hero.buttonLabel);
    formData.append("image", hero.image);

    await axios.post(`${API_URL}/api/top-hero`, formData);
    alert("Hero section saved");
  };

  const submitProducts = async (e) => {
    e.preventDefault();
    for (const p of products) {
      const formData = new FormData();
      Object.entries(p).forEach(([key, val]) => {
        if (key !== "preview" && val) formData.append(key, val);
      });
      await axios.post(`${API_URL}/api/top-picks`, formData);
    }
    alert("Top picks saved");
  };

  const renderStars = (rating) => {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5;
    const stars = [];

    for (let i = 0; i < full; i++)
      stars.push(<i key={i} className="bi bi-star-fill text-warning me-1" />);
    if (half)
      stars.push(<i key="h" className="bi bi-star-half text-warning me-1" />);
    while (stars.length < 5)
      stars.push(
        <i
          key={"e" + stars.length}
          className="bi bi-star text-warning opacity-25 me-1"
        />
      );
    return stars;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10">
      {/* ✅ Full Preview Section */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4">Live Preview</h2>
        <div className="row g-4">
          {/* Left Hero */}
          <div className="col-12 col-md-6">
            <div className="border rounded shadow-sm overflow-hidden">
              {hero.preview && (
                <img
                  src={hero.preview}
                  alt="Hero Preview"
                  className="w-100 h-64 object-contain"
                />
              )}
              <div className="p-4 text-center">
                <h4>{hero.title || "Daily Essentials Combos"}</h4>
                <p className="text-muted mb-3">
                  {hero.description || "Everything you need for everyday meals — in one value pack!"}
                </p>
                <a href="/products" className="btn btn-success px-4">
                  {hero.buttonLabel || "Shop Daily Combos"}
                </a>
              </div>
            </div>
          </div>

          {/* Right Product Cards */}
          <div className="col-12 col-md-6">
            <div className="row g-3">
              {products.map((p, i) => (
                <div className="col-12 col-sm-6" key={i}>
                  <div className="border rounded shadow-sm p-3 position-relative">
                    {p.badge && (
                      <span className="position-absolute top-0 start-0 m-2 px-2 py-1 bg-danger text-white rounded">
                        {p.badge}
                      </span>
                    )}
                    {p.preview && (
                      <img
                        src={p.preview}
                        alt={`Preview ${i + 1}`}
                        className="w-100 h-40 object-contain mb-2 rounded"
                      />
                    )}
                    <div className="fw-bold">{p.title}</div>
                    <div className="text-success fw-semibold">
                      {p.price}
                      {p.oldPrice && (
                        <del className="ms-2 text-muted">{p.oldPrice}</del>
                      )}
                    </div>
                    <div className="d-flex align-items-center gap-2 text-muted">
                      {renderStars(parseFloat(p.rating))}
                      <small>{p.rating}</small>
                    </div>
                    <a href="/products" className="btn btn-success w-100 mt-2">
                      GET YOUR PRODUCT
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ✅ Hero Form */}
      <form onSubmit={submitHero} className="bg-white p-6 rounded shadow space-y-4">
        <h2 className="text-xl font-bold">Left Side Hero Section</h2>
        <input name="title" value={hero.title} onChange={handleHeroChange} placeholder="Title" className="w-full border p-2 rounded" />
        <textarea name="description" value={hero.description} onChange={handleHeroChange} placeholder="Description" className="w-full border p-2 rounded" />
        <input name="buttonLabel" value={hero.buttonLabel} onChange={handleHeroChange} placeholder="Button Label" className="w-full border p-2 rounded" />
        <input type="file" onChange={handleHeroImage} className="w-full border p-2 rounded" />
        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Save Hero</button>
      </form>

      {/* ✅ Product Form */}
      <form onSubmit={submitProducts} className="bg-white p-6 rounded shadow space-y-6">
        <h2 className="text-xl font-bold">Right Side Top Picks</h2>
        {products.map((p, idx) => (
          <div key={idx} className="border p-4 rounded space-y-2">
            <h4 className="font-semibold">Product {idx + 1}</h4>
            <input value={p.title} onChange={(e) => handleProductChange(idx, "title", e.target.value)} placeholder="Title" className="w-full border p-2 rounded" />
            <input value={p.price} onChange={(e) => handleProductChange(idx, "price", e.target.value)} placeholder="Price" className="w-full border p-2 rounded" />
            <input value={p.oldPrice} onChange={(e) => handleProductChange(idx, "oldPrice", e.target.value)} placeholder="Old Price" className="w-full border p-2 rounded" />
            <input value={p.rating} onChange={(e) => handleProductChange(idx, "rating", e.target.value)} placeholder="Rating" className="w-full border p-2 rounded" />
            <input value={p.badge} onChange={(e) => handleProductChange(idx, "badge", e.target.value)} placeholder="Badge" className="w-full border p-2 rounded" />
            <input type="file" onChange={(e) => handleProductImage(idx, e.target.files[0])} className="w-full border p-2 rounded" />
          </div>
        ))}
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Save Top Picks</button>
      </form>
    </div>
  );
}
