import express from "express";
import dotenv from "dotenv";
import conectarDB from "./config/db.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import proyectoRoutes from "./routes/proyectoRoutes.js";
import tareaRoutes from "./routes/tareaRoutes.js"; 
import cors from "cors"


//empieza la aplicacion o servidor
const app = express();
// habilitamos para leer datos JSON
    app.use(express.json());

// busca el file to enviroment variables
dotenv.config()
// conecta a la base de datos
conectarDB();


// configurar CORS
const whitelist = [process.env.FRONTEND_URL];
console.log(process.env.FRONTEND_URL)

const corsOption = {
    origin: function(origin, callback){ // ese origin se busca en la whitelist
        if(whitelist.includes(origin)){
            // puede enviar request
            callback(null, true)
        }else{
            // no puede enviar request
            callback(new Error("Error de Cors"))
        }
    }
}
// sin esta mierda nada sirve
app.use(cors(corsOption))


// Routing -- esos son los Endpoints  para cada ruta --
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/proyectos", proyectoRoutes);
app.use("/api/tareas", tareaRoutes);


// si existe la variable de entorno para el puerto 
// la usa y si no existe usa el puerto 4000 o el que le pongamos
const PORT = process.env.PORT || 4000;

const servidor = app.listen( PORT, () => {
    console.log(`Server Running at PORT: ${PORT}`);
})

// socket IO configuration 
import { Server } from "socket.io";

const io = new Server(servidor, {
    pingTimeout: 60000,
    // el cors es para decirle de donde vienen las peticiones
    cors: {
        origin: process.env.FRONTEND_URL,        
    },
} );

// abrir coneccion del io 

io.on("connection", (socket) => {
    console.log("CONECTADO  a Socket.io");

    // Definir los Eventos de Socket
    // crea un ROOM para la comunicacion de     
    //los usuarios en tiempo real
    socket.on('abrir proyecto', proyecto => {   
        socket.join(proyecto);        
    })

    // crea una nueva tarea
    socket.on("nueva tarea", (tarea) => {
        
        const proyecto = tarea.proyecto;        
        socket.to(proyecto).emit('tarea agregada', tarea);
    })
    // elimina una tarea
    socket.on("eliminar tarea", tarea => {
        const proyecto = tarea.proyecto
        socket.to(proyecto).emit('tarea eliminada', tarea);
    })

    //ACTUALIZAR TAREA
    socket.on("actualizar tarea", tarea => {
       const proyecto = tarea.proyecto._id;
       socket.to(proyecto).emit("tarea actualizada", tarea);
    })

    // CAMBIAR EL ESTADO

    socket.on("cambiar estado", tarea => {
        const proyecto = tarea.proyecto._id;
        socket.to(proyecto).emit("nuevo estado", tarea)
    })
})