import express from "express";
import checkAuth from "../middleware/checkAuth.js";
import comprobarIdMongo from "../middleware/checkValidMongoID.js";

import {
  obtenerProyectos,
  nuevoProyecto,
  obtenerProyecto,
  editarProyecto,
  eliminarProyecto,
  buscarColaborador,
  agregarColaborador,
  eliminarColaborador,
  obtenerTareas,
} from "../controllers/proyectoController.js";



const router = express.Router();

// creando rutas
router
  .route("/")
  .get(checkAuth, obtenerProyectos)
  .post(checkAuth, nuevoProyecto);

  // esta es la ruta para editar proyectos
router
  .route("/:id")
  .get(checkAuth, comprobarIdMongo, obtenerProyecto)
  .put(checkAuth, comprobarIdMongo, editarProyecto) // update
  .delete(checkAuth, comprobarIdMongo, eliminarProyecto) // eliminar

router.get("/tareas/:id", checkAuth,  comprobarIdMongo, obtenerTareas);

// routes colaboradores dentro de proyectos agregar comprobarIdMongo si da clavos el id
router.post("/colaboradores",      checkAuth, buscarColaborador)
router.post("/colaboradores/:id",  checkAuth, agregarColaborador);
router.post("/eliminar-colaborador/:id", checkAuth, eliminarColaborador); // PUEDE SER POST aunque vaya a eliminar pero el .delete borra un recurso completo



export default router;
