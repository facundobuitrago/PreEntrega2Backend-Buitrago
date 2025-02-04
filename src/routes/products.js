import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

// Obtener todos los productos
router.get("/", async (req, res) => {
  try {
    const productos = await Product.find();
    res.json(productos);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener productos" });
  }
});

// Obtener un producto por ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send("Producto no encontrado");
    res.json(product);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener producto" });
  }
});

// Crear un nuevo producto
router.post("/", async (req, res) => {
  try {
    const nuevoProducto = new Product(req.body);
    await nuevoProducto.save();
    res.status(201).json(nuevoProducto);
  } catch (error) {
    res.status(400).json({ mensaje: "Error al crear producto", error });
  }
});

// Eliminar un producto
router.delete("/:id", async (req, res) => {
  try {
    const productoEliminado = await Product.findByIdAndDelete(req.params.id);
    if (!productoEliminado) return res.status(404).send("Producto no encontrado");
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar producto" });
  }
});

export default router;
