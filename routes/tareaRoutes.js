import express from "express"
import checkAuth from "../middleware/checkAuth.js";
import comprobarIdMongo from "../middleware/checkValidMongoID.js";

import  {
    agregarTarea,
    obtenerTarea,
    actualizarTarea,
    eliminarTarea,
    cambiarEstado
} from "../controllers/tareaController.js"


const router = express.Router();

router.post("/", checkAuth, agregarTarea);

router
    .route("/:id")
    .get(checkAuth, comprobarIdMongo, obtenerTarea) 
    .put(checkAuth, comprobarIdMongo, actualizarTarea)
    .delete(checkAuth, comprobarIdMongo,eliminarTarea)

router.post("/estado/:id", checkAuth, comprobarIdMongo, cambiarEstado)


export default router