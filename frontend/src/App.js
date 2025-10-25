import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
// 1. DESCOMENTAR la importación de xlsx
import * as XLSX from "xlsx"; 

const initialState = {
  title: "",
  author: "",
  isbn: "",
  publishedYear: "",
  genre: ""
};

const API_URL = "http://localhost:5000/api/books";

function App() {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState(initialState);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchBooks = useCallback(async () => {
    // Obtenemos todos los datos para aplicar filtros localmente
    try {
      // Hacemos el GET sin parámetro de búsqueda para obtener la lista completa
      const res = await axios.get(API_URL);
      const allData = res.data;

      // Aplicamos el filtro de búsqueda solo para la vista
      if (searchTerm) {
        const lowerCaseSearch = searchTerm.toLowerCase();
        const filteredBooks = allData.filter(book =>
            book.title.toLowerCase().includes(lowerCaseSearch) ||
            book.author.toLowerCase().includes(lowerCaseSearch)
        );
        setBooks(filteredBooks);
      } else {
        setBooks(allData); // Mostrar todos si no hay búsqueda
      }
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
        await axios.put(`${API_URL}/${editingId}`, dataToSend);
      } else {
        await axios.post(API_URL, dataToSend);
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
    try {
        await axios.delete(`${API_URL}/${id}`);
        fetchBooks();
    } catch (error) {
        console.error("Error al eliminar libro:", error);
        alert("Ocurrió un error al intentar eliminar el libro.");
    }
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

  // --- 2. RESTAURAR LA FUNCIÓN COMPLETA DE EXPORTACIÓN A EXCEL ---
  const exportToExcel = () => {
     if (books.length === 0) {
       alert("No hay libros para exportar en la vista actual.");
       return;
     }
     const dataToExport = books.map(book => ({
       'Título': book.title,
       'Autor': book.author,
       'ISBN': book.isbn,
       'Año de Publicación': book.publishedYear,
       'Género': book.genre
     }));
     const worksheet = XLSX.utils.json_to_sheet(dataToExport);
     const workbook = XLSX.utils.book_new();
     XLSX.utils.book_append_sheet(workbook, worksheet, "Libros");
     XLSX.writeFile(workbook, "catalogo_libros.xlsx");
  };

  // Lógica: Exportar a PDF (Imprimir la lista) - Funciona
  const exportToPDF = () => {
    window.print();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e0f7fa 0%, #b3e5fc 100%)'
    }}>
      {/* Estilos para impresión (sin cambios) */}
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            .printable-list, .printable-list * { visibility: visible; }
            .printable-list { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
            .action-buttons { display: none !important; }
            .list-group-item { border: 1px solid #dee2e6 !important; margin-bottom: 0.5rem !important; box-shadow: none !important; page-break-inside: avoid; }
            .no-print { display: none !important; }
          }
        `}
      </style>

      <div className="container py-5">
        <h1 className="display-4 mb-4 text-primary font-weight-bold no-print">
            <span style={{color: '#673ab7'}}>📚</span>
            Catálogo de Libros
        </h1>

        <div className="mb-4 d-flex justify-content-between align-items-center no-print">
            <input
                className="form-control form-control-lg shadow-sm w-50 me-3"
                type="text"
                placeholder="Buscar libros por Título o Autor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            {/* --- 3. RESTAURAR EL BOTÓN DE EXCEL --- */}
            <div className="btn-group">
                <button
                    className="btn btn-info shadow-sm me-2" // Vuelve a ser btn-info
                    onClick={exportToExcel}
                >
                    Exportar a Excel ({books.length})
                </button>
                <button
                    className="btn btn-danger shadow-sm"
                    onClick={exportToPDF}
                >
                    Exportar a PDF
                </button>
            </div>
        </div>

        {/* Resto del JSX (formulario, lista, etc.) sin cambios */}
        <div className="card p-4 shadow-lg mb-5 no-print" style={{borderRadius: '15px'}}>
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
            style={{transition: 'transform 0.2s', transform: 'scale(1.0)'}}
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
        <div className="list-group printable-list">
          {books.map((book) => (
            <div key={book.id} className="list-group-item d-flex justify-content-between align-items-center shadow-sm mb-3" style={{borderRadius: '10px'}}>
              <div className="flex-grow-1">
                <h5 className="mb-1 text-primary">{book.title}</h5>
                <p className="mb-1 text-muted">{book.author} ({book.publishedYear})</p>
                <small className="text-info font-weight-light">ISBN: {book.isbn}</small>
                {book.genre && <span className="badge bg-secondary text-white ms-3">{book.genre}</span>}
              </div>
              <div className="btn-group action-buttons">
                <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(book)}>Editar</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(book.id)}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
        {books.length === 0 && (
          <div className="text-center mt-5 alert alert-info no-print">
            {searchTerm ? (<p>No se encontraron resultados para "{searchTerm}".</p>) : (<p>No hay libros en el catálogo. ¡Agrega el primero!</p>)}
          </div>
        )}
        <p className="text-center text-muted text-sm mt-10 no-print">CRUD Full Stack con React, Node.js y Sequelize</p>
      </div>
    </div>
  );
}

export default App;