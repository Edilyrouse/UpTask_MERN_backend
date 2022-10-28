import Proyecto from "../models/Proyecto.js"
import Tarea from "../models/Tareas.js";


/////////////Funcion para agregar tareas////////////////

const agregarTarea = async (req, res) => {
    // esto viene del request.body del Proyecto por eso lo importamos
    const { proyecto } = req.body;
    
    const existeProyecto = await Proyecto.findById(proyecto);

    if(!existeProyecto){
        const error = new Error("No existe Proyecto");
        return res.status(404).json({ msg: error.message })
    }

    const creadorProyecto = existeProyecto.creador.toString();
    const usuarioRequiere = req.usuario._id.toString();

    if(creadorProyecto !== usuarioRequiere){
        const error = new Error("No tienes privilegios para crear Tareas en este Proyecto");
        return res.status(404).json({msg: error.message})
    }
    try {
        //Almacena la tarea
        const tareaAlmacenada = await Tarea.create(req.body)
        // almacena el Id del poryecto a que pertenece la tarea
        existeProyecto.tareas.push(tareaAlmacenada._id);
        await existeProyecto.save();
        // retornamos resultado 
        return res.json(tareaAlmacenada);
    } catch (error) {
        console.log(error)
    }
}


/////////////Funcion para Lllamar una tarea

const obtenerTarea = async (req, res) => {
    const { id } = req.params;

    // El populate ayuda a join tables PARA VER a que proyecto pertenece
    // sabiendo el proyecto  podemos ver si quien realiza la soliciutd es el mismo 
    // que el creador
    const tarea = await Tarea.findById(id).populate("proyecto");

    if(!tarea){
        const error = new Error("No existe la tarea")
        return res.status(404).json({ msg: error.message})
    }

    // Solo la persona que ha creado la tarea la puede llamar de regreso
    const usuarioCreador = tarea.proyecto.creador.toString();
    const usuarioRequiere = req.usuario._id.toString();

    if(usuarioCreador !== usuarioRequiere){
        const error = new Error("No tiene privilegios sobre esta Tarea");
        return res.status(403).json({msg: error.message});
    }else {
        return res.json({tarea})
    }  
}


/////////////Funcion para actualizar 
const actualizarTarea = async (req, res) => {

    const { id } = req.params;

    const tarea = await Tarea.findById(id).populate("proyecto");

    if(!tarea){
        const error = new Error("No existe la tarea")
        return res.status(404).json({ msg: error.message})
    }

    // Solo la persona que ha creado la tarea la puede llamar de regreso
    const usuarioCreador = tarea.proyecto.creador.toString();
    const usuarioRequiere = req.usuario._id.toString();

    if(usuarioCreador !== usuarioRequiere){
        const error = new Error("No tiene privilegios sobre esta Tarea");
        return res.status(403).json({msg: error.message});
    }

    // Tomar la informacion a ser grabada en la dba, si no vienen cambios guarda
    // lo mismo que ya venia de la base de datos
    tarea.nombre  = req.body.nombre || tarea.nombre;
    tarea.descripcion  = req.body.descripcion || tarea.descripcion;
    tarea.prioridad  = req.body.prioridad || tarea.prioridad; 
    tarea.fechaEntrega  = req.body.fechaEntrega || tarea.fechaEntrega;

    // mandar a guardar
    try {
        const tareaAlmacenada = await tarea.save();
        return res.json(tareaAlmacenada)  
    } catch (error) {
        console.log(error)
    }

}


/////////////Funcion para Eliminar una tarea
const eliminarTarea = async (req, res) => {

    const { id } = req.params;
    // El populate ayuda a join tables PARA VER a que proyecto pertenece
    // sabiendo el proyecto  podemos ver si quien realiza la soliciutd es el mismo 
    // que el creador
    const tarea = await Tarea.findById(id).populate("proyecto");

    if(!tarea){
        const error = new Error("No existe la tarea")
        return res.status(404).json({ msg: error.message})
    }

    // Solo la persona que ha creado la tarea la puede llamar de regreso
    const usuarioCreador = tarea.proyecto.creador.toString();
    const usuarioRequiere = req.usuario._id.toString();

    if(usuarioCreador !== usuarioRequiere){
        const error = new Error("No tiene privilegios sobre esta Tarea");
        return res.status(403).json({msg: error.message});
    } 

    try {
        // eleimna la referencia de la tarea en el proyecto
        const proyecto = await Proyecto.findById(tarea.proyecto);
        proyecto.tareas.pull(tarea._id)
        // await proyecto.save()
        // elimina la tarea de la coleccion pero no del proyecto
        // await tarea.deleteOne()
        await Promise.allSettled([await proyecto.save(), await tarea.deleteOne()])

        return res.json({msg: "Tarea Eliminada"})
    } catch (error) {
        console.log(error)
    }

}


/////////////Funcion para cambiar el estado de la tarea
const cambiarEstado = async (req, res) => {
    const { id } = req.params;
    // El populate ayuda a join tables PARA VER a que proyecto pertenece
    // sabiendo el proyecto  podemos ver si quien realiza la soliciutd es el mismo 
    // que el creador
    const tarea = await Tarea.findById(id).populate("proyecto");

    if(!tarea){
        const error = new Error("No existe la tarea")
        return res.status(404).json({ msg: error.message})
    }

    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString() && !tarea.proyecto.colaboradores.some(
        colaborador => colaborador._id.toString() === req.usuario._id.toString()
    )){
        const error = new Error("No tienes Privilegios para realizar esta Acción");
        return res.status(403).json({msg: error.message})
    }

    tarea.estado = !tarea.estado;
    tarea.completado = req.usuario._id;
    await tarea.save()

    // actualizar el estado para que muestre el nombre de quien completo la tarea
    const tareaAlmacenada = await Tarea.findById(id).populate("proyecto").populate("completado");



    return res.json(tareaAlmacenada);
}

export {
    agregarTarea,
    obtenerTarea,
    actualizarTarea,
    eliminarTarea,
    cambiarEstado
}

