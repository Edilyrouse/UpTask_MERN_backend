import mongoose from "mongoose";
import bcrypt from "bcrypt";


// definir Schema

const usuarioSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String, // es string xq no es tipo de input AK ES TIPO DE DATO
      required: true,
      trim: true,
      unique: true,
    },

    token: {
      type: String,
    },  

    confirmado: {
      type: Boolean,
      default: false,
    },
  },
  {
    tipestamps: true,
  }
);

// manda a hashear los passwords
  usuarioSchema.pre('save', async function(next){
    //.isModified es funcion de mongo
    // este if es si el password YA ESTA HASHADO NO  se cambia, segui, 
    // para que no se hashee lo ya hashado
    if(!this.isModified("password")){
      next();
    };
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

  })


// checking if password is correct
// asi como existe el bcrypt.hash tambien existe el bcript.compare
// bcrypt.compare recibie los parametros, el primero es el dato y el segundo
// el que ya esta encriptado

usuarioSchema.methods.comprobarPassword = async function(passwordFormulario){
  return await bcrypt.compare(passwordFormulario, this.password)
}







//con esto creamos el modelo ---- lo puse con U minuscula desde el principio
const Usuario = mongoose.model("Usuario", usuarioSchema);
export default Usuario;


