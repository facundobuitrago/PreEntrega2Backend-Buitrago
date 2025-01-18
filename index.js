import path from "path";
import express from "express";
import { __dirname } from "./src/dirname.js";
import morgan from "morgan";
import { Server } from "socket.io";
import fs from "fs";
import handlebars from "express-handlebars";
import productsRoutes from "./src/routes/products.js";
import cartsRoutes from "./src/routes/carts.js";

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde la carpeta "public"
app.use(express.static(path.join(__dirname, "public")));

// Rutas API
app.use("/api/products", productsRoutes);
app.use("/api/carts", cartsRoutes);

// Leer productos desde el archivo JSON
const productosFilePath = path.join(__dirname, "data", "products.json");

const readProducts = () => {
  if (fs.existsSync(productosFilePath)) {
    const data = fs.readFileSync(productosFilePath, "utf-8");
    return JSON.parse(data || "[]");
  }
  return [];
};

const saveProducts = (productos) => {
  fs.writeFileSync(productosFilePath, JSON.stringify(productos, null, 2));
};

// Configuración de Handlebars
app.engine(
  "hbs",
  handlebars.engine({
    extname: ".hbs",
    defaultLayout: "main.hbs",
  })
);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

// Rutas para vistas
app.get("/", (req, res) => {
  try {
    const products = readProducts();
    res.render("home", { title: "Productos", products });
  } catch (error) {
    console.error("Error rendering home view:", error);
    res.status(500).send("Error interno del servidor.");
  }
});

app.get("/real-time-products", (req, res) => {
  try {
    const products = readProducts();
    res.render("realTimeProducts", {
      title: "Productos en Tiempo Real",
      products,
    });
  } catch (error) {
    console.error("Error rendering real-time-products view:", error);
    res.status(500).send("Error interno del servidor.");
  }
});

// WebSocket config
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const io = new Server(server);
io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado:", socket.id);

  // Enviar los productos actuales al cliente cuando se conecta
  socket.emit("productos-actuales", readProducts());

  // Manejar eliminación de productos
  socket.on("delete-product", (productId) => {
    console.log("Evento delete-product recibido para ID:", productId);
    const productos = readProducts();
    const index = productos.findIndex((producto) => producto.id === productId);
    if (index !== -1) {
      productos.splice(index, 1); // Eliminar producto de la lista
      saveProducts(productos); // Guardar la lista actualizada en el archivo
      io.emit("productos-actuales", productos); // Emitir lista actualizada
      console.log("Producto eliminado y lista actualizada emitida.");
    } else {
      console.log(`Producto con ID ${productId} no encontrado.`);
    }
  });

  // Manejar creación de productos
  socket.on("add-product", (newProduct) => {
    console.log("Evento add-product recibido:", newProduct);
    const productos = readProducts();
    productos.push({ ...newProduct, id: Date.now().toString() }); // Agregar ID único
    saveProducts(productos);
    io.emit("productos-actuales", productos); // Emitir lista actualizada
  });
});