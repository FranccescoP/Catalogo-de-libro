import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

const initialState = {
  title: "",
  author: "",
  isbn: "",
  publishedYear: "",
  genre: ""
};

function App() {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState(initialState);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); 

  const fetchBooks = useCallback(async () => {
    const apiUrl = `http://localhost:5000/api/books${searchTerm ? `?search=${searchTerm}` : ""}`;
    
    try {
      const res = await axios.get(apiUrl);
      setBooks(res.data);
    } catch (error) {
      console.error("Error al obtener libros:", error);
    }
  }, [searchTerm]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchBooks();
    }, 300); 

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, fetchBooks]);

  useEffect(() => {
    if (!searchTerm) { 
        fetchBooks();
    }
  }, [fetchBooks, searchTerm]);


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const dataToSend = { ...form };
    
    if (dataToSend.publishedYear) {
      dataToSend.publishedYear = parseInt(dataToSend.publishedYear, 10);
    } else {
      dataToSend.publishedYear = null; 
    }

    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/books/${editingId}`, dataToSend);
      } else {
        await axios.post("http://localhost:5000/api/books", dataToSend);
      }
      
      setForm(initialState);
      setEditingId(null);
      fetchBooks(); 
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        alert("Error de validación: " + error.response.data.error);
      } else {
        alert("Ocurrió un error (Verifique el servidor backend).");
      }
    }
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5000/api/books/${id}`);
    fetchBooks(); 
  };

  const handleEdit = (book) => {
    setForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      publishedYear: book.publishedYear || "", 
      genre: book.genre || "" 
    });
    setEditingId(book.id);
  };

  return (
    // ESTILO EN LÍNEA: Gradiente, Altura Mínima
    <div style={{
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #e0f7fa 0%, #b3e5fc 100%)' // Gradiente azul claro
    }}>
      <div className="container py-5">
        <h1 className="display-4 mb-4 text-primary font-weight-bold">
            <span style={{color: '#673ab7'}}>📚</span>
            Catálogo de Libros
        </h1>
        
        {/* CAMPO DE BÚSQUEDA */}
        <div className="mb-4">
          <input
            className="form-control form-control-lg shadow-sm" // Clases de Bootstrap
            type="text"
            placeholder="Buscar libros por Título o Autor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* FORMULARIO DE CAPTURA */}
        <div className="card p-4 shadow-lg mb-5" style={{borderRadius: '15px'}}> {/* Estilo en línea para borde */}
          <h2 className="h4 text-secondary mb-3">{editingId ? "Editar Libro" : "Agregar Nuevo Libro"}</h2>
          
          <div className="row g-3">
            <div className="col-md-6"><input className="form-control" name="title" value={form.title} onChange={handleChange} placeholder="Título" /></div>
            <div className="col-md-6"><input className="form-control" name="author" value={form.author} onChange={handleChange} placeholder="Autor" /></div>
            <div className="col-md-6"><input className="form-control" name="isbn" value={form.isbn} onChange={handleChange} placeholder="ISBN (10 o 13 dígitos)" /></div>
            <div className="col-md-6"><input className="form-control" type="number" name="publishedYear" value={form.publishedYear} onChange={handleChange} placeholder="Año de Publicación" /></div>
            <div className="col-12"><input className="form-control" name="genre" value={form.genre} onChange={handleChange} placeholder="Género (Ej. Ficción, Ciencia)" /></div>
          </div>

          <button 
            className={`btn btn-block mt-4 ${editingId ? 'btn-info' : 'btn-success'}`}
            onClick={handleSubmit}
            style={{transition: 'transform 0.2s', transform: 'scale(1.0)'}} // CSS en línea para efecto
          >
            {editingId ? "Actualizar Libro" : "Agregar Libro"}
          </button>
          
          {editingId && (
            <button 
                className="btn btn-secondary btn-block mt-2"
                onClick={() => {setEditingId(null); setForm(initialState);}}
            >
                Cancelar Edición
            </button>
          )}
        </div>

        {/* LISTA DE LIBROS */}
        <div className="list-group">
          {books.map((book) => (
            <div
              key={book.id}
              className="list-group-item d-flex justify-content-between align-items-center shadow-sm mb-3"
              style={{borderRadius: '10px'}} // Estilo en línea para borde
            >
              <div className="flex-grow-1">
                <h5 className="mb-1 text-primary">{book.title}</h5>
                <p className="mb-1 text-muted">
                  {book.author} ({book.publishedYear})
                </p>
                <small className="text-info font-weight-light">ISBN: {book.isbn}</small>
                {book.genre && <span className="badge bg-secondary text-white ms-3">{book.genre}</span>}
              </div>
              <div className="btn-group">
                <button
                  className="btn btn-warning btn-sm me-2"
                  onClick={() => handleEdit(book)}
                >
                  Editar
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(book.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {books.length === 0 && (
          <div className="text-center mt-5 alert alert-info">
            {searchTerm ? (
                <p>No se encontraron resultados para "{searchTerm}".</p>
            ) : (
                <p>No hay libros en el catálogo. ¡Agrega el primero!</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;