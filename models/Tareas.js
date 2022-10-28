import mongoose from "mongoose";

const tareaSchema = mongoose.Schema({
    nombre: {
        type: String,
        trim: true,
        require: true,
    },
    descripcion: {
        type: String,
        trim: true,
        require: true,
    },
    estado: {
        type: Boolean,
        default: false
    },
    fechaEntrega: {
        type: Date,
        required: true,
        default: Date.now()
    },
    prioridad: {
        type: String,
        required: true,
        enum: ['Baja', 'Media' , 'Alta']        
    },
    proyecto: { // esta es la relacion con el proyecto al que se va a signar la tarea
        type: mongoose.Schema.Types.ObjectId,
        ref: "Proyecto",
    },
    completado: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Usuario",
    },
}, {
    timestramps: true
});

const Tarea = mongoose.model('Tarea', tareaSchema);

export default Tarea