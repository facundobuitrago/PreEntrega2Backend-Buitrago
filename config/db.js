import mongoose from "mongoose";

const conectarDB = async () => {
  try {
    // Asegúrate de reemplazar <db_password> con tu contraseña real y especifica el nombre de la base de datos si es necesario
    await mongoose.connect("mongodb+srv://facundobuitrago:coder@cluster0.3te2r.mongodb.net/baseDeDatos?retryWrites=true&w=majority");

    console.log("Conexión exitosa a MongoDB");
  } catch (error) {
    console.error("Error al conectar con MongoDB:", error);
    process.exit(1); // Termina el proceso si no se puede conectar
  }
};

export default conectarDB;
