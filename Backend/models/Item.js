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
      len: [10, 13] // Validación de longitud, ya sea ISBN-10 o ISBN-13
    }
  },
  publishedYear: {
    type: DataTypes.INTEGER,
    allowNull: true, // Año de publicación es opcional
    validate: {
      isInt: true, 
      min: 1000, 
      max: new Date().getFullYear() 
    }
  },
  genre: {
    type: DataTypes.STRING,
    allowNull: true 
  }
}, {
  // Opciones adicionales para el modelo
  tableName: 'books', // Nombre de la tabla en la base de datos
  timestamps: false // Si no quieres que Sequelize agregue campos de fechas automáticas (createdAt, updatedAt)
});

module.exports = Book;
