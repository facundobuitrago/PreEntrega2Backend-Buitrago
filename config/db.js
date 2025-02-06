

import mongoose from "mongoose";

const conectarDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://facundobuitrago:coder@cluster0.3te2r.mongodb.net/baseDeDatos?retryWrites=true&w=majority", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Conexión exitosa a MongoDB");
  } catch (error) {
    console.error("Error al conectar a MongoDB", error);
    process.exit(1);
  }
};

export default conectarDB;