const express = require("express");
const router = express.Router();
const Item = require("../models/Item");

// Crear
router.post("/", async (req, res) => {
  try {
    const item = await Item.create(req.body);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Leer
router.get("/", async (req, res) => {
  const items = await Item.findAll();
  res.json(items);
});

// Actualizar
router.put("/:id", async (req, res) => {
  const item = await Item.findByPk(req.params.id);
  if (item) {
    await item.update(req.body);
    res.json(item);
  } else {
    res.status(404).json({ error: "Item no encontrado" });
  }
});

// Eliminar
router.delete("/:id", async (req, res) => {
  const item = await Item.findByPk(req.params.id);
  if (item) {
    await item.destroy();
    res.json({ message: "Item eliminado" });
  } else {
    res.status(404).json({ error: "Item no encontrado" });
  }
});

module.exports = router;
