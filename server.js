import path from "path";
import express from "express";
import { __dirname } from "./src/dirname.js";
import morgan from "morgan";
import { Server } from "socket.io";
import fs from "fs";
import handlebars from "express-handlebars";
import productsRoutes from "./src/routes/products.js";
import cartsRoutes from "./src/routes/carts.js";
import conectarDB from "./config/db.js";

// Conectar a la base de datos

conectarDB();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

// Rutas API
app.use("/api/products", productsRoutes);
app.use("/api/carts", cartsRoutes);

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
app
