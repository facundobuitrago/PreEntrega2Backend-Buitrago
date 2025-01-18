import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const cartsFile = path.join(__dirname, '../data/carts.json');

const productsFile = path.join(__dirname, '../data/products.json');

const readCarts = () => {
    if (!fs.existsSync(cartsFile)) return [];

    try {
        const data = fs.readFileSync(cartsFile, 'utf-8');
        return JSON.parse(data || '[]');
    } catch (error) {
        console.error('Error al leer o parsear el archivo de carritos:', error);
        return [];
    }
};

const saveCarts = (carts) => {
    try {
        fs.writeFileSync(cartsFile, JSON.stringify(carts, null, 2));
    } catch (error) {
        console.error('Error al guardar el archivo de carritos:', error);
    }
};

router.post('/', (req, res) => {
    const carts = readCarts();
    const newCart = {
        id: carts.length > 0 ? Math.max(...carts.map(c => c.id)) + 1 : 1, // Asignación de ID único
        products: []
    };
    carts.push(newCart);
    saveCarts(carts);
    res.status(201).json(newCart);
});

router.get('/:cid', (req, res) => {
    const carts = readCarts();
    const cart = carts.find(c => c.id === parseInt(req.params.cid));
    if (!cart) return res.status(404).send('Carrito no encontrado');
    res.json(cart.products);
});

router.delete('/:cid', (req, res) => {
    const carts = readCarts();
    const cartIndex = carts.findIndex(c => c.id === parseInt(req.params.cid));

    if (cartIndex === -1) {
        return res.status(404).send('Carrito no encontrado');
    }

    carts.splice(cartIndex, 1);
    saveCarts(carts);
    res.status(200).send('Carrito eliminado');
});

router.post('/:cid/product/:pid', (req, res) => {
    const carts = readCarts();
    const cart = carts.find(c => c.id === parseInt(req.params.cid));
    if (!cart) return res.status(404).send('Carrito no encontrado');

    // Leer los productos solo una vez
    const products = JSON.parse(fs.readFileSync(productsFile, 'utf-8'));
    const product = products.find(p => p.id === parseInt(req.params.pid));
    if (!product) return res.status(404).send('Producto no encontrado');

    // Verificar si el producto ya está en el carrito
    const existingProduct = cart.products.find(p => p.product === product.id);

    if (existingProduct) {
        existingProduct.quantity += 1; // Aumentar la cantidad
    } else {
        cart.products.push({ product: product.id, quantity: 1 }); // Agregar producto nuevo
    }

    saveCarts(carts);
    res.status(200).json(cart);
});

export default router;
