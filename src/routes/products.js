import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    
    const { page = 1, limit = 10 } = req.query; 
    
    // Configuración de paginación
    const options = {
      page: parseInt(page),  
      limit: parseInt(limit),  
      lean: true,  
    };
    
    const result = await Product.paginate({}, options);

    
    const response = {
      status: "success",
      payload: result.docs,  
      totalPages: result.totalPages,  
      prevPage: result.prevPage,  
      nextPage: result.nextPage,  
      page: result.page,  
      hasPrevPage: result.hasPrevPage, 
      hasNextPage: result.hasNextPage,  
      prevLink: result.hasPrevPage ? `/api/products?page=${result.prevPage}&limit=${limit}` : null,  
      nextLink: result.hasNextPage ? `/api/products?page=${result.nextPage}&limit=${limit}` : null, 
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
