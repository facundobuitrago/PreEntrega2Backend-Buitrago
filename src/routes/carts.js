import express from "express";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

const router = express.Router();

// Crear un nuevo carrito
router.post("/", async (req, res) => {
  try {
    const newCart = new Cart({ products: [] });
    await newCart.save();
    res.status(201).json(newCart);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al crear carrito" });
  }
});

// Obtener productos de un carrito
router.get("/:cid", async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid).populate("products.product");
    if (!cart) return res.status(404).send("Carrito no encontrado");
    res.json(cart.products);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener carrito" });
  }
});

// Agregar un producto a un carrito
router.post("/:cid/product/:pid", async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid);
    if (!cart) return res.status(404).send("Carrito no encontrado");

    const product = await Product.findById(req.params.pid);
    if (!product) return res.status(404).send("Producto no encontrado");

    // Buscar si el producto ya está en el carrito
    const existingProduct = cart.products.find(p => p.product.equals(product._id));

    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.products.push({ product: product._id, quantity: 1 });
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al agregar producto al carrito" });
  }
});

// Eliminar un carrito
router.delete("/:cid", async (req, res) => {
  try {
    const carritoEliminado = await Cart.findByIdAndDelete(req.params.cid);
    if (!carritoEliminado) return res.status(404).send("Carrito no encontrado");
    res.status(200).send("Carrito eliminado");
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar carrito" });
  }
});

export default router;
