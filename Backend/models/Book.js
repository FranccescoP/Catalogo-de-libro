const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Book = sequelize.define('Book', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true 
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false 
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false 
  },
  isbn: {
    type: DataTypes.STRING,
    allowNull: false, 
    unique: true, 
    validate: {
      len: [10, 13] // Validación para ISBN-10 o ISBN-13
    }
  },
  publishedYear: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      isInt: true, 
      min: 1000, 
      max: new Date().getFullYear() // El año no puede ser en el futuro
    }
  },
  genre: {
    type: DataTypes.STRING,
    allowNull: true 
  }
}, {
  tableName: 'books', // Nombre exacto de la tabla
  timestamps: false // No crea campos createdAt y updatedAt
});

module.exports = Book;