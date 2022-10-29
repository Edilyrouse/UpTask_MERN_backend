import mongoose from "mongoose";


const conectarDB = async() => {
    try{
            // si ya no funciona quitar el DB del process.env.MONGODB_URUI
        const connection = await mongoose.connect(process.env.MONGODB_URI)
        const url = `${connection.connection.host}:${connection.connection.port}`;
        console.log(`MongoDB Conectado en: ${url}`)
    } catch(error){
        console.log(`error: ${error.message}`)
        process.exit(1);
    }
}

export default conectarDB;