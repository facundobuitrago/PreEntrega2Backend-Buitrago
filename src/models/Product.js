import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

// Conexión a la base de datos
const conectarDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://facundobuitrago:coder@cluster0.3te2r.mongodb.net/baseDeDatos?retryWrites=true&w=majority");
    console.log("Conexión exitosa a MongoDB");
  } catch (error) {
    console.error("Error al conectar con MongoDB:", error);
    process.exit(1);
  }
};

const productSchema = new mongoose.Schema({
  nombre: String,
  descripcion: String,
  precio: Number,
  stock: Number,
  id: String,
});

// Aplicar el plugin de paginación al esquema
productSchema.plugin(mongoosePaginate);

// Definir el modelo
const Product = mongoose.model('Product', productSchema);

// Insertar los productos
const productos = [
  {
    nombre: "Consola",
    descripcion: "Nintendo Switch",
    precio: 40000,
    stock: 3,
    id: "1737235982228"
  },
  {
    nombre: "Joystick",
    descripcion: "Mando de Xbox",
    precio: 23000,
    stock: 3,
    id: "1737236386361"
  },
  {
    nombre: "Red Dead",
    descripcion: "Juego",
    precio: 30000,
    stock: 3,
    id: "1737418683258"
  }
];

const agregarProductos = async () => {
  try {
    await conectarDB();  // Asegúrate de que la base de datos esté conectada antes de insertar
    await Product.insertMany(productos);  // Insertar los productos en la base de datos
    console.log('Productos agregados a la base de datos');
  } catch (error) {
    console.error('Error al agregar productos:', error);
  }
};

// Ejecutar la función para agregar productos
agregarProductos();

export default Product;
