import Usuario from "../models/Usuario.js";
import generarId from "../helpers/generarId.js";
import generarJWT from "../helpers/generarJWT.js";
import { emailRegistro, emailOlvidePassword } from "../helpers/emails.js";

//**********  FUNCION PARA REGISTRAR UN USUARIO   *************** */


const registrar = async (req, res) => {
  //Evitar registros duplicados
  
  const { email } = req.body;
  const existeUsuario = await Usuario.findOne({ email: email });
  if (existeUsuario) {
    const error = new Error("Correo ya Registrado");
    return res.status(400).json({ msg: error.message });
  }

  try {
    const usuario = new Usuario(req.body);
    usuario.token = generarId();
    await usuario.save();
    // Enviar Email confirmar
    emailRegistro({
      email: usuario.email,
      name: usuario.name,
      token: usuario.token
    })
    return res.json({ msg: "Usuario Almacenado Correctamente - Revisa tu Email Para confirmar cuenta"})
    //res.json({ usuarioAlmacenado }); Esto es por si queres devolver toda la info que viene
  } catch (error) {
    console.log(error);
  }
};

/**************Funcion autenticar usuario***************************/

const autenticar = async (req, res) => {
  const { email, password } = req.body;
  // Comprobar usuario existe
  const usuario = await Usuario.findOne({ email });
  if (!usuario) {
    const error = new Error("El Usuario no Existe");
    return res.status(404).json({ msg: error.message });
  }

  // Comprobar si Usuario esta confirmado
  if (!usuario.confirmado) {
    const error = new Error("Usuario no Confirmado - Confirm with Email sent ");
    return res.status(403).json({ msg: error.message });
  }

  // comprobar si el password es correcto
  if (await usuario.comprobarPassword(password)) {
    res.json({
      _id: usuario._id,
      nombre: usuario.name,
      email: usuario.email,
      token: generarJWT(usuario._id), // se llama la funcion para generarlo al hot
    });
  } else {
    const error = new Error("Usuario o Password Incorrecto");
    return res.status(400).json({ msg: error.message });
  }
};


// funcion para CONFIRMAR EL USUARIO 
// la informacion viene en la URL no en un body request por eso usamos
// req.params
const confirmar = async (req, res) => {
  // Confirmar si el token existe o No. El token dejara de existir una vez
  // este utilizado
  const { token } = req.params;


  const usuarioConfirmar = await Usuario.findOne({ token });
  // sin o existe el token
  if (!usuarioConfirmar) {
    const error = new Error("- Token no Válido - ");
    return res.status(400).json({ msg: error.message });
  }

  try {
    usuarioConfirmar.confirmado = true;
    usuarioConfirmar.token = "";
    await usuarioConfirmar.save();
    return res.json({ msg: "Usuario Confirmado" });
  } catch (error) {
    console.log(error);
  }
};

/////////////////////Funcion resetear Password////////////////////////////////////

const olvidePassword = async (req, res) => {
  const { email } = req.body;

  // comprobar si el usuario existe
  const usuario = await Usuario.findOne({ email });
  if (!usuario) {
    const error = new Error("Usuario no existe");
    return res.status(404).json({ msg: error.message });
  }

  try {
    usuario.token = generarId();
    const data = await usuario.save();


    // enviar el email
    emailOlvidePassword({
      email: usuario.email,
      name: usuario.name,
      token: usuario.token
    })

    // mensaje a mostrar en pantalla
    return res.json({ msg: "Hemos enviado un Email con instrucciones" });
  } catch (error) {
    console.log(error);
  }
};

////////////////Funcion  comporobar token para resetear Password////////////

const comprobarToken = async (req, res) => {

  const {token} = req.params;  

  const tokenValido = await Usuario.findOne( { token } );
  if(!tokenValido){
    const error = new Error("Error el token no es valido");
     res.status(404).json({ msg: error.message });
  
  }else{
    res.json({msg: "Token Valido"})
  }

}

/////// funcion cambiar el password despues que se valido el token /////

const nuevoPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  
  const usuario = await Usuario.findOne( { token } );
  if(!usuario){
    const error = new Error("Error el token no es valido");
    return res.status(404).json({ msg: error.message });
  
  }else{
    usuario.password = password;
    usuario.token = "";
    await usuario.save();
    res.json({ msg: "Password Modificado Correctamente"});
  }

}

//////////////  FUNCION PERFIL  ////////////////////

const perfil = async(req, res) => {
  // este request viene del middleware o del servidorcd 
  const { usuario } = req
  res.json(usuario)
}

export { registrar, 
         autenticar, 
         confirmar, 
         olvidePassword, 
         comprobarToken, 
         nuevoPassword, 
         perfil,
        };

