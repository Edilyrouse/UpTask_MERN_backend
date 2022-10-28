// se utilizar la libreria para decodificar el jwt
import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';



/// ejemmplo custom middleware 

const checkAuth = async (req, res, next) => {
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        try {
            token = req.headers.authorization.split(" ")[1];
            // la funcion jwt.verify() recibe dos parametros, el token -por eso se quita el bearer y la variable de entorno que se uso para firmarlo-
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
             
            // como en la firma viene del jwt viene el id del usuario podemos mandar    a consultarlo de una vez
            //se pone el .select para que no traiga el password en la respuesta  del req.usuario, osea toda esa informacion no0 la necesitamos -tal, -tal2, etc
            req.usuario = await Usuario.findById(decoded.id).select("            -password -confirmado -token -createdAt -updatedAt -__v");
            
            return next()

        } catch (error) {
            return res.status(404).json({msg: "No se puede validar Token Inicie Session Nuevamente"})
        }
    }

    if(!token){
        const error = new Error("Sin Autorizacion - Iniciar Session para acceder");
        return res.status(401).json({ msg: error.message });
    }
    next();
}

export default checkAuth;
