import nodemailer from "nodemailer";

// funcion para mandar correo de registro

export const emailRegistro = async (datos) => {
  const { email, name, token } = datos;

  // codigo que proporciona Mailtrap para hacer pruebas
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Informacion del email

  const info = await transport.sendMail({
    from: '"UpTask - Administrador de Proyectos" <cuentas@uptask.com>',
    to: email,
    subject: "Up-Task - Confirma tu cuenta",
    text: "Comprueba tu cuenta en upTask",
    html: `<p>Hola ${name} Comprueba tu cuenta en UpTask </p>
        <p>Tu cuenta ya esta casi lista, solo debes comprobarla en el siguiente enlace: </p> 
        <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Comprobar Cuenta </a>
        <p>Si no creaste esta cuenta, puedes ignorar este mensaje</p>     
    `,
  });
};

/// FUNCION PARA MANDAR correo a enviar por si olvido password

export const emailOlvidePassword = async (datos) => {
  const { email, name, token } = datos;
   
  // codigo que proporciona Mailtrap para hacer pruebas
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Informacion del email

  const info = await transport.sendMail({
    from: '"UpTask - Administrador de Proyectos" <cuentas@uptask.com>',
    to: email,
    subject: "Up-Task - Reestablece tu password",
    text: "Reestablece tu password",
    html: `<p>Hola ${name} has solicititado reestablecer tu password </p>
        <p>Sigue el enlace para generar un nuevo password: </p> 
        <a href="${process.env.FRONTEND_URL}/olvide-password/${token}">Reestablecer Password </a>
        <p>Si tu no solicitaste este email, ingnora el mensaje</p>     
    `,
  });
};
