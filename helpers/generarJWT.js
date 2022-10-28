import jwt from "jsonwebtoken";

const generarJWT = (id) => {
    ///.sign() Recibe tRES parametros un objeto y la fimar
    /// la palabra secrea se recomienda algo mas completo o complejo
    /// el tercerparametro es para ver cuando expira minutos, segundos o dias etc

    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
}

export default generarJWT