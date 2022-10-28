import mongoose from "mongoose";

const proyectoSchema = mongoose.Schema({
    nombre: {
        type: String,
        trim: true,
        required: true,        
    },
    descripcion: {
        type: String,
        trim: true,
        required: true,   
    },
    fechaEntrega: {
        type: Date,
        default: Date.now(),
    },
    cliente:{
        type: String,
        trim: true,
        required: true,   
    },
    // este creador es de tipo usuario- el usuario que creo el proyecto
    //
    creador:{
       type: mongoose.Schema.Types.ObjectId,
       ref: "Usuario",
    },
    // Pueden ser varias tareas en un mismo proyecto: por eso es arreglo
    // esto es como hacer una relacion con la otra collection
    tareas: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tarea",
        },
    ],
    // colaboradores es un arreglo xq puede tener más de un colaborador
    colaboradores: [ 
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Usuario"
        },   
    ],
}, 
{
    timestamps: true,
}
);

const Proyecto = mongoose.model("Proyecto", proyectoSchema);

export default Proyecto;