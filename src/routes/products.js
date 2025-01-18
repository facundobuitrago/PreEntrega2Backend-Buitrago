import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';  // Asegúrate de importar fileURLToPath correctamente
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const router = express.Router();

const productsFile = path.join(__dirname, '../data/products.json');

const readProducts = () => {
    if (!fs.existsSync(productsFile)) return [];
    const data = fs.readFileSync(productsFile, 'utf-8');
    return JSON.parse(data || '[]');
};

const saveProducts = (products) => {
    fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
};

router.delete('/:id', (req, res) => {
    const products = readProducts();
    const productosFiltrados = products.filter(p => p.id !== parseInt(req.params.id));

    if (productosFiltrados.length === products.length) {
        return res.status(404).send('Producto no encontrado');
    }

    saveProducts(productosFiltrados);
    res.status(204).send();
});

router.get('/', (req, res) => {
    const products = readProducts();
    res.json(products);
});

router.get('/:id', (req, res) => {
    const products = readProducts();
    const product = products.find(p => p.id === parseInt(req.params.id));
    if (!product) return res.status(404).send('Producto no encontrado');
    res.json(product);
});

router.post('/', (req, res) => {
    const products = readProducts();
    const { nombre, descripcion, codigo, precio, stock, categoria, imagenes } = req.body;

    // Verifico si existe
    if (!nombre || !descripcion || !codigo || !precio || !stock || !categoria) {
        return res.status(400).send('Todos los campos son obligatorios.');
    }

    const nuevoProducto = {
        id: products.length + 1,
        nombre,
        descripcion,
        codigo,
        precio,
        stock,
        categoria,
        imagenes: imagenes || []
    };

    products.push(nuevoProducto);
    saveProducts(products);
    res.status(201).json(nuevoProducto);
});

export default router;
