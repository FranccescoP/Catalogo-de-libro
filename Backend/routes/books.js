const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize'); 
const Op = Sequelize.Op;
const Book = require('../models/Book'); 

// --- CRUD PARA LIBROS (BOOKS) ---

// CREAR un libro (POST /api/books)
router.post('/', async (req, res) => {
  try {
    const book = await Book.create(req.body);
    res.json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LEER/BUSCAR todos los libros (GET /api/books?search=termino)
router.get('/', async (req, res) => {
  const { search } = req.query; 
  let whereClause = {}; 

  if (search) {
    const lowerCaseSearch = search.toLowerCase();

    // SINTAXIS CORREGIDA: Usamos Sequelize.where() directamente dentro del Op.or
    whereClause = {
      [Op.or]: [
        Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('title')), {
          [Op.like]: `%${lowerCaseSearch}%`
        }),
        Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('author')), {
          [Op.like]: `%${lowerCaseSearch}%`
        })
      ]
    };
  }
  
  try {
    const books = await Book.findAll({
      where: whereClause
    });
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ACTUALIZAR un libro (PUT /api/books/:id)
router.put('/:id', async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      await book.update(req.body);
      res.json(book);
    } else {
      res.status(404).json({ error: 'Libro no encontrado' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ELIMINAR un libro (DELETE /api/books/:id)
router.delete('/:id', async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      await book.destroy();
      res.json({ message: 'Libro eliminado' });
    } else {
      res.status(404).json({ error: 'Libro no encontrado' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
