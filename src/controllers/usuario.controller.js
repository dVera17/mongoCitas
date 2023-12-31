import conn from "../db/connection.js";
import ErrorHandler from "../storage/ErrorHandler.js";
const db = await conn();
let usuario = db.collection("usuario");
let cita = db.collection("cita");

const getPacientes = async (req, res) => {
    try {
        let result = await usuario.find({}).sort({ nombre: 1 }).toArray();
        res.send(result);
    } catch (error) {
        let err = new ErrorHandler(error);
        res.status(err.status).send(err.showMessage());
    }
}

const getProximaCita = async (req, res) => {
    try {
        let result = await cita.find({
            dni_usuario: parseInt(req.params.dni),
            estado: "programada"
        }).sort({ fecha: 1 }).limit(1).toArray();
        if (!result || !result.length) {
            res.send("El usuario no tiene una cita programada");
            return;
        }
        res.send(result);
    } catch (error) {
        res.send(error)
    }
}

const getPacitentesMismoDoctor = async (req, res) => {
    try {
        let result = await usuario.aggregate([
            {
                $lookup:
                {
                    from: "cita",
                    localField: "dni",
                    foreignField: "dni_usuario",
                    as: "citas"
                }
            },
            {
                $match: { "citas.cod_matriProfesional_med": parseInt(req.params.med_matri) }
            }
        ])
        res.send(result)
    } catch (error) {
        let err = new ErrorHandler(error);
        res.status(err.status).send(err.showMessage());
    }
}

const getConsultorias = async (req, res) => {
    try {
        let result = await cita.aggregate([
            {
                $match: {
                    dni_usuario: parseInt(req.params.dni),
                    estado: "programada"
                }
            },
            {
                $lookup: {
                    from: "medico",
                    localField: "cod_matriProfesional_med",
                    foreignField: "cod_matriProfesional",
                    as: "medico"
                }
            },
            {
                $lookup: {
                    from: "especialidad",
                    localField: "medico.id_especialidad",
                    foreignField: "id",
                    as: "especialidad"
                }
            },
            {
                $lookup: {
                    from: "consultorio",
                    localField: "medico.id_consultorio",
                    foreignField: "id",
                    as: "consultorio"
                }
            },
            {
                $project: {
                    _id: 0,
                    codigo: 1,
                    fecha: 1,
                    medico: { $arrayElemAt: ["$medico", 0] },
                    especialidad: { $arrayElemAt: ["$especialidad", 0] },
                    consultorio: { $arrayElemAt: ["$consultorio", 0] }
                }
            }
        ]);
        res.send(result);
    } catch (error) {
        let err = new ErrorHandler(error);
        res.status(err.status).send(err.showMessage());

    }
}

export const usuarioController = {
    getPacientes,
    getProximaCita,
    getPacitentesMismoDoctor,
    getConsultorias
}