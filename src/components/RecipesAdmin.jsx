import React, { useState, useEffect } from "react";
import axios from "axios";

export default function RecipesAdmin() {
  const [recipes, setRecipes] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", image: null, preview: "" });
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";


  // Fetch recipes
  const fetchRecipes = async () => {
    const res = await axios.get(`${API_URL}/api/recipes`);
    setRecipes(res.data);
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setForm({ ...form, image: file, preview: URL.createObjectURL(file) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("image", form.image);

    await axios.post(`${API_URL}/api/recipes`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    alert("Recipe added successfully!");
    setForm({ title: "", description: "", image: null, preview: "" });
    fetchRecipes(); // ✅ refresh list
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-10">
      {/* ✅ Live Preview Grid */}
      <section>
        <h2 className="text-xl font-bold mb-4">Live Preview</h2>
        <div className="row g-4">
          {recipes.map((r) => (
            <div className="col-12 col-md-3" key={r.id}>
              <div className="card h-100 shadow-sm">
                <img src={r.image_url} alt={r.title} className="card-img-top" style={{ height: "200px", objectFit: "cover" }} />
                <div className="card-body">
                  <h5 className="card-title">{r.title}</h5>
                  <p className="card-text text-muted">{r.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ✅ Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
        <h2 className="text-xl font-bold mb-4">Add Recipe</h2>
        {form.preview && (
          <div className="border rounded p-4 mb-4 bg-gray-50">
            <h3 className="font-semibold mb-2">Preview</h3>
            <img src={form.preview} alt="Preview" className="w-full h-48 object-contain rounded mb-2" />
            <h4>{form.title}</h4>
            <p className="text-muted">{form.description}</p>
          </div>
        )}
        <input type="text" name="title" value={form.title} onChange={handleChange} placeholder="Recipe Title" className="w-full border p-2 rounded" />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="w-full border p-2 rounded" />
        <input type="file" name="image" onChange={handleFileChange} className="w-full border p-2 rounded" />
        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Add Recipe</button>
      </form>
    </div>
  );
}