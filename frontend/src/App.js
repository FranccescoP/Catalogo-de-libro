import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState(null); // ← Nuevo: para saber si estamos editando

  const fetchItems = async () => {
    const res = await axios.get("http://localhost:5000/api/items");
    setItems(res.data);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (editingId) {
      // Si hay un ID, estamos editando
      await axios.put(`http://localhost:5000/api/items/${editingId}`, form);
    } else {
      // Si no hay ID, estamos creando
      await axios.post("http://localhost:5000/api/items", form);
    }
    setForm({ name: "", description: "" });
    setEditingId(null); // Salir del modo edición
    fetchItems();
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5000/api/items/${id}`);
    fetchItems();
  };

  const handleEdit = (item) => {
    setForm({ name: item.name, description: item.description });
    setEditingId(item.id);
  };

  return (
    <div className="container mt-4">
    <h1 className="text-primary">CRUD React + Node</h1>
    <div className="mb-3">
      <input className="form-control mb-2" name="name" value={form.name} onChange={handleChange} placeholder="Nombre" />
      <input className="form-control mb-2" name="description" value={form.description} onChange={handleChange} placeholder="Descripción" />
      <button className="btn btn-success" onClick={handleSubmit}>
        {editingId ? "Actualizar" : "Agregar"}
      </button>
    </div>
    <ul className="list-group">
      {items.map(item => (
        <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
          <span><b>{item.name}</b>: {item.description}</span>
          <div>
            <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(item)}>Editar</button>
            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>Eliminar</button>
          </div>
        </li>
      ))}
    </ul>
  </div>

  );
}

export default App;
