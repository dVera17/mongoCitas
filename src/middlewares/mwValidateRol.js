import conn from "../db/connection.js";
const db = await conn();
let cliente = db.collection("cliente")

const validateRol = async (req, res, next) => {
    try {
        const roles = await cliente.distinct("rol");
        if (roles.includes(req.user.rol) && roles.includes(req.baseUrl.split('/')[2])) next();
        else res.status(403).send('No tienes permisos para acceder a este recurso');
    } catch (error) {
        res.send(error);
    }
}

export default validateRol;