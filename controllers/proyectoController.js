import Proyecto from "../models/Proyecto.js";
import Usuario from "../models/Usuario.js";
import Tarea from "../models/Tareas.js";

/**********  Obtener proyectos Solo los creados por el usuario autenticado **********/
const obtenerProyectos = async (req, res) => {
  // req.usuario ya esta disponible desde el middleware que verifica
  // la autenticacion del proyecto
  const proyectos = await Proyecto.find({
    '$or': [
      {'colaboradores' : {$in: req.usuario}},
      {'creador'       : {$in: req.usuario}},
    ]
  }).select("-tareas");
    // .where("creador")
    // .equals(req.usuario)
    //

  return res.json(proyectos);
};

/*******    Crear Proyecto    Nuevo *************/
const nuevoProyecto = async (req, res) => {
  const proyecto = new Proyecto(req.body);
  proyecto.creador = req.usuario._id;

  try {
    const proyectoAlmacenado = await proyecto.save();
    res.json(proyectoAlmacenado);
  } catch (error) {
    console.log(error);
  }
};

/*********Solo obtine un proyecto segun su ID ***********/

const obtenerProyecto = async (req, res) => {
  const { id } = req.params;

  const proyecto = await Proyecto.findById(id)
    .populate({ path: 'tareas', populate: {path:'completado', select: "name"}})
    .populate("colaboradores", "name email");

  // el Id ya viene validado del middleware
  if (!proyecto) {
    const error = new Error("No existe el Proyecto");
    return res.status(404).json({ msg: error.msg });
  }
  if (proyecto.creador.toString() !== req.usuario._id.toString() && !proyecto.colaboradores.some( colaborador => colaborador._id.toString() === req.usuario._id.toString())) {
    const error = new Error(
      "Accion no Valida - No tienes privilegios sobre este Proyecto"
    );
    return res.status(401).json({ msg: error.message });
  }

  // OBTENER las TAREAS DEL PROYECTO
  //const tareas = await Tarea.find().where("proyecto").equals(proyecto._id);

  return res.json(proyecto);
};

/*********  funcion para editar un proyecto ya existente***********/
const editarProyecto = async (req, res) => {
  const { id } = req.params;

  const proyecto = await Proyecto.findById(id);
  // el Id ya viene validado del middleware
  if (!proyecto) {
    const error = new Error("No existe el Proyecto");
    return res.status(404).json({ msg: error.message });
  }

  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error(
      "Accion no Valida - No tienes privilegios sobre este Proyecto"
    );
    return res.status(401).json({ msg: error.message });
  }

  // si pasa las validaciones manda a guardar
  // si viene nombre en el request || si no que guarde el que ya tiene en la baseDatos

  proyecto.nombre = req.body.nombre || proyecto.nombre;
  proyecto.descripcion = req.body.descripcion || proyecto.descripcion;
  proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega;
  proyecto.cliente = req.body.cliente || proyecto.cliente;

  try {
    const proyectoAlmacenado = await proyecto.save();
    res.json(proyectoAlmacenado);
  } catch (error) {
    console.log(error);
  }
};

/**********     Eliminar un proyecto **********/
// solo la persona que ha creado el proyecto puede eleminarlo
// el proyecto tiene que existir para ser eliminado

const eliminarProyecto = async (req, res) => {
  const { id } = req.params;

  const proyecto = await Proyecto.findById(id);
  // el Id ya viene validado del middleware
  if (!proyecto) {
    const error = new Error("No existe el Proyecto");
    return res.status(404).json({ msg: error.message });
  }

  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error(
      "Accion no Valida - No tienes privilegios sobre este Proyecto"
    );
    return res.status(401).json({ msg: error.message });
  }

  try {
    // await va directo ya que no estamos asignando ninguna vairable o ningun valor
    await proyecto.deleteOne();
    res.json({ msg: "Proyecto Eliminado" });
  } catch (error) {
    console.log(error);
  }
};

/********************/
const buscarColaborador = async (req, res) => {
  const { email } = req.body;
  const usuario = await Usuario.findOne({ email }).select(
    "-confirmado -createdAt -password -token -updatedAt -__v"
  );

  if (!usuario) {
    const error = new Error("Usuario no encontrado");
    return res.status(404).json({ msg: error.message });
  }

  return res.json(usuario);
};

const agregarColaborador = async (req, res) => {
  const proyecto = await Proyecto.findById(req.params.id);
  // verifica si existe el proyecto
  if (!proyecto) {
    const error = new Error("No existe el proyecto");
    return res.status(404).json({ msg: error.message });
  }

  // Verifica si el Creador es el mismo que desea hacer el cambio

  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Acción no Permitida - Consulta con el Administrador de proyectos, los privilegios asignados en tu perfil sobre este proyecto");
    return res.status(404).json({ msg: error.message });
  }
  // validar que exista
  const { email } = req.body;
  const usuario = await Usuario.findOne({ email }).select(
    "-confirmado -createdAt -password -token -updatedAt -__v"
  );

  if (!usuario) {
    const error = new Error("Usuario no encontrado");
    return res.status(404).json({ msg: error.message });
  }

  // validar que el colaborador NO SEA EL ADMIN DEL PROYECTO
  if (proyecto.creador.toString() === usuario._id.toString()) {
    const error = new Error(
      "El Administrador de Proyecto no Puede ser Colaborador"
    );
    return res.status(404).json({ msg: error.message });
  }

  // REVISAR QUE NO ESTE AGREGADO AL PROYECTO
  // REVISANDO EL ARRAY QUE TENENMOS EN EL MODELO
  if (proyecto.colaboradores.includes(usuario._id)) {
    const error = new Error("El usuario ya Fue agregado al proyecto");
    return res.status(404).json({ msg: error.message });
  }

  // si ya todo esta bien se PUEDE AGREGAR
  proyecto.colaboradores.push(usuario._id);
  await proyecto.save();
  return res.json({
    msg: "Colaborador Agregado correctamente",
  });
};

/********************/
const eliminarColaborador = async (req, res) => {

    const proyecto = await Proyecto.findById(req.params.id);
    // verifica si existe el proyecto
    if (!proyecto) {
      const error = new Error("No existe el proyecto");
      return res.status(404).json({ msg: error.message });
    }
    // Verifica si el Creador es el mismo que desea hacer el cambio
    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
      const error = new Error("Acción no Permitida - No tienes privilegios para Eliminar colaboradores");
      return res.status(404).json({ msg: error.message });
    }
    // si ya valido todo,  esta bien se PUEDE ELIMINAR UN COLABORADOR DEL PROYECOT
    console.log(req.body)
    proyecto.colaboradores.pull(req.body.id);

    await proyecto.save();
     res.json({
      msg: "Colaborador Eliminado correctamente",
    });   

 
};

/********* objterner tareas, recibe el id del proyecto***********/
// se mando a llamar en OBTENER PROYECTO DE UNA VEZ
// PARA EVITAR DOBLE LLAMADO A LA BASE DE DATOS
//  no la borre PERO YA NO SE USA
const obtenerTareas = async (req, res) => {
  /*    const { id } = req.params;

   const existeProyecto = await Proyecto.findById(id)
   if(!existeProyecto){
      const error = new Error("No Existe el proyecto");
      return res.status(404).res({msg: error.message});
   }

   // colaboradores y creadores pueden tener acceso
   const tareas = await Tarea.find().where("proyecto").equals(id);
   if(!tareas){
      return res.json({ msg: "Proyecto no tiene tareas asignadas"})
   }
   res.json(tareas) */
};

export {
  obtenerProyectos,
  nuevoProyecto,
  obtenerProyecto,
  editarProyecto,
  eliminarProyecto,
  buscarColaborador,
  agregarColaborador,
  eliminarColaborador,
  obtenerTareas,
};
