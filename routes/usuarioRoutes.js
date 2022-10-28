import express from "express";
import checkAuth from "../middleware/checkAuth.js";

import { registrar, 
         autenticar, 
         confirmar, 
         olvidePassword, 
         comprobarToken, 
         nuevoPassword,
         perfil,

        } from "../controllers/usuarioController.js";

const router = express.Router();

//  Autenticacion, Registro y Confirmacion de usuarios

router.post('/', registrar) //Crear usuario
router.post('/login', autenticar); // ruta para autenticar
router.get('/confirmar/:token', confirmar) // con los dos puntos se crea routing dinamico
router.post('/olvide-password', olvidePassword) // funcion para enviar token a resetear password
//  estas rutas como apunta a la misma URL se puede abreviar
// router.get('/olvide-password/:token', comprobarToken); // comprueba token para resetear password
// router.post('/olvide-password/:token', nuevoPassword); // comprueba token para resetear password
// ****  esto es propio de express ****
router.route('/olvide-password/:token').get(comprobarToken).post(nuevoPassword);

// esta ruta lleva el middleware confirma autorizacion true go to perfil
router.get('/perfil', checkAuth, perfil);

export default router;

