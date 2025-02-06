import path from "path";
import express from "express";
import { fileURLToPath } from "url";
import morgan from "morgan";
import http from "http";
import { Server } from "socket.io";
import fs from "fs";
import handlebars from "express-handlebars";
import session from "express-session";
import productsRoutes from "./src/routes/products.js";
import cartsRoutes from "./src/routes/carts.js";
import conectarDB from "./config/db.js";
import { v4 as uuidv4 } from "uuid";
import Product from './src/models/Product.js';

// Configurar __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Conectar a la base de datos
conectarDB();

const app = express();
const server = http.createServer(app); 
const io = new Server(server); 

// Configurar sesión
app.use(
  session({
    secret: "coder",
    resave: false,
    saveUninitialized: true,
  })
);

// Leer productos desde el archivo
const productosFilePath = path.join(__dirname, "src", "data", "products.json");

const readProducts = () => {
  try {
    const data = fs.readFileSync(productosFilePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error al leer el archivo de productos", error);
    return [];
  }
};

const saveProducts = (productos) => {
  try {
    fs.writeFileSync(productosFilePath, JSON.stringify(productos, null, 2));
  } catch (error) {
    console.error("Error al guardar el archivo de productos", error);
  }
};

// Manejar la conexión de clientes con Socket.io
io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado");

  // Emitir la lista de productos actuales
  socket.emit("productos-actuales", readProducts());

  // Manejar el evento de agregar un producto
  socket.on("add-product", (newProduct) => {
    if (!newProduct || !newProduct.nombre || !newProduct.precio) {
      return socket.emit("error", "Producto incompleto");
    }
    
    function createProduct(producto) {
      const li = document.createElement("li");
      li.id = `product-${producto.id}`;
      li.className = "collection-item";
      li.innerHTML = `
        <h2>${producto.nombre}</h2>
        <p>${producto.descripcion}</p>
        <p>Precio: $${producto.precio}</p>
        <p>Stock: ${producto.stock}</p>
        <button class="delete-btn">Eliminar</button>
      `;
      
      // Añadir evento al botón de eliminar
      const deleteButton = li.querySelector(".delete-btn");
      deleteButton.addEventListener("click", () => {
        socket.emit("delete-product", producto.id); 
      });
    
      return li;
    }
    
    const productos = readProducts();
    newProduct.id = uuidv4();
    productos.push(newProduct);
    saveProducts(productos);
    io.emit("productos-actuales", productos);
  });

  // Manejar el evento de eliminar un producto
  socket.on("delete-product", (productId) => {
    if (!productId) {
      return socket.emit("error", "ID de producto no proporcionado");
    }

    let productos = readProducts();
    productos = productos.filter((producto) => producto.id !== productId);
    saveProducts(productos);
    io.emit("productos-actuales", productos);
  });

  // Desconexión del cliente
  socket.on("disconnect", () => {
    console.log("Cliente desconectado");
  });
});

// Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Rutas API
app.use("/api/products", productsRoutes);
app.use("/api/carts", cartsRoutes);

// Ruta principal
app.get("/", async (req, res) => {
  try {
    const productos = await Product.find();
    res.render("home", {
      title: "Lista de Productos",
      products: productos
    });
  } catch (error) {
    console.error("Error al obtener los productos:", error);
    res.status(500).send("Error al cargar los productos");
  }
});

// Ruta para mostrar productos en tiempo real
app.get("/real-time-products", (req, res) => {
  res.render("realTimeProducts", { title: "Productos en Tiempo Real", products: readProducts() });
});

// Ruta para agregar productos al carrito
app.post("/add-to-cart", (req, res) => {
  const product = req.body;
  if (!req.session.cart) {
    req.session.cart = [];
  }
  req.session.cart.push(product);
  res.redirect("/");
});

// Ruta para mostrar el carrito
app.get("/cart", (req, res) => {
  res.render("cart", { cart: req.session.cart || [] });
});

// Configuración de Handlebars
app.engine(
  "hbs",
  handlebars.engine({
    extname: ".hbs",
    defaultLayout: "main.hbs",
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,  
      allowProtoMethodsByDefault: true,    
    }
  })
);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "src", "views"));

// Configuración del puerto
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
