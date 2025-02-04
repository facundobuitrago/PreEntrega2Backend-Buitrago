import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

// Obtener todos los productos con paginación
router.get("/", async (req, res) => {
  try {
    // Obtener los parámetros de la consulta para la paginación (page y limit)
    const { page = 1, limit = 10 } = req.query; // Página actual y límite de productos por página
    
    // Configuración de paginación
    const options = {
      page: parseInt(page),  // Página solicitada
      limit: parseInt(limit),  // Límites de los resultados por página
      lean: true,  // Hace la consulta más rápida
    };
    
    // Realizar la paginación
    const result = await Product.paginate({}, options);

    // Construir el objeto de respuesta con la paginación
    const response = {
      status: "success",
      payload: result.docs,  // Productos de la página solicitada
      totalPages: result.totalPages,  // Total de páginas
      prevPage: result.prevPage,  // Página anterior
      nextPage: result.nextPage,  // Página siguiente
      page: result.page,  // Página actual
      hasPrevPage: result.hasPrevPage,  // Si hay página anterior
      hasNextPage: result.hasNextPage,  // Si hay página siguiente
      prevLink: result.hasPrevPage ? `/api/products?page=${result.prevPage}&limit=${limit}` : null,  // Enlace a la página anterior
      nextLink: result.hasNextPage ? `/api/products?page=${result.nextPage}&limit=${limit}` : null,  // Enlace a la página siguiente
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener productos", error });
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
