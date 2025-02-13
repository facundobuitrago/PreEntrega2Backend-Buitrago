import path from "path";
import express from "express";
import { fileURLToPath } from "url";
import morgan from "morgan";
import http from "http";
import { Server } from "socket.io";
import handlebars from "express-handlebars";
import session from "express-session";
import productsRoutes from "./src/routes/products.js";
import cartsRoutes from "./src/routes/carts.js";
import conectarDB from "./config/db.js";
import Product from './src/models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

conectarDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(
  session({
    secret: "coder",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/products", productsRoutes);
app.use("/api/carts", cartsRoutes);

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

app.get("/real-time-products/", async (req, res) => {
  try {
    const productos = await Product.find().lean();
    res.render("realTimeProducts", { title: "Productos en Tiempo Real", products: productos });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).send("Error al cargar productos");
  }
});

app.post("/add-to-cart", async (req, res) => {
  const productId = req.body.productId;
  try {
    const product = await Product.findById(productId).lean();
    if (!product) {
      return res.status(404).send("Producto no encontrado");
    }

    if (!req.session.cart) {
      req.session.cart = [];
    }

    const existingProduct = req.session.cart.find(item => item._id === product._id);
    if (existingProduct) {
      existingProduct.quantity = (existingProduct.quantity || 1) + 1;
    } else {
      product.quantity = 1;
      req.session.cart.push(product);
    }

    res.redirect("/cart");
  } catch (error) {
    console.error("Error al agregar al carrito:", error);
    res.status(500).send("Error al agregar al carrito");
  }
});

app.get("/cart", (req, res) => {
  console.log("Datos del carrito en la sesión:", req.session.cart);

  res.render("cart", {
      cart: req.session.cart || [], 
      totalPrice: (cart) => { 
          let total = 0;
          if (cart) {
              cart.forEach(item => {
                  total += item.precio;
              });
          }
          return total;
      }
  });
});

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

io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado");

  (async () => {
    const productos = await Product.find().lean();
    socket.emit("productos-actuales", productos);
  })();

  const createProductElement = (producto) => {
    const li = document.createElement("li");
    li.dataset.productId = producto._id;
    li.className = "product";
    li.innerHTML = `
      <h2>${producto.nombre}</h2>
      <p>${producto.descripcion}</p>
      <p>Precio: $${producto.precio}</p>
      <p>Stock: ${producto.stock}</p>
      <button class="add-to-cart-btn" data-product-id="${producto._id}">Agregar</button>
      <button class="delete-btn" data-product-id="${producto._id}">Eliminar</button>
    `;
    return li;
  };

  socket.on("add-product", async (newProduct) => {
    try {
      const product = new Product(newProduct);
      await product.save();
      const productos = await Product.find().lean();
      io.emit("productos-actuales", productos);
    } catch (error) {
      console.error("Error al agregar producto:", error);
      socket.emit("error", "Error al agregar producto");
    }
  });

 // Manejar el evento de eliminar un producto
 socket.on("delete-product", async (productId) => {
  try {
      console.log("Eliminando producto con ID:", productId); 
      console.log(typeof productId); 

      const result = await Product.deleteOne({ _id: productId });

      console.log("Resultado de la eliminación:", result); 

      if (result.deletedCount === 0) {
          console.log("No se encontró el producto para eliminar:", productId);
          return;
      }

      const productos = await Product.find().lean();
      io.emit("productos-actuales", productos); 
  } catch (error) {
      console.error("Error al eliminar producto:", error); 
      socket.emit("error", "Error al eliminar producto");
  }
});
  socket.on("disconnect", () => {
    console.log("Cliente desconectado");
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});