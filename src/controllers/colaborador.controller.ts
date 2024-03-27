import { Request, Response, RequestHandler } from "express";

import { DepartamentoModel } from "../models/departamento.model";
import { ColaboradorModel } from "../models/colaborador.model";

export const registrarColaborador:RequestHandler = async (req: Request, res: Response) => {
    const { cedula, nombre, correo, nombreDepartamento, telefono, contrasena, proyecto } = req.body;
    const departamento = await DepartamentoModel.findOne({ nombre: nombreDepartamento });
    try {
        const colaborador = new ColaboradorModel({
            cedula,
            nombre,
            correo,
            departamento,
            telefono,
            contrasena,
            proyecto: proyecto ? proyecto : null,
        });
        await colaborador.save();
        return res.status(201).json({ message: "Se ha creado el colaborador con exito", colaborador});
    } catch (error) {
        return res.status(400).json({ message: `Error: No se ha podido crear el colaborador: ${error}`})
    }
}

export const logearColaborador:RequestHandler = async (req: Request, res: Response) => {
    const { correo, contrasena } = req.body;
    try {
        const colaborador = await ColaboradorModel.findOne({ correo },  ["nombre", "cedula", "departamento", "correo", "proyecto", "telefono"] ).populate("proyecto").populate("departamento");
        if (!colaborador || !colaborador.validarContrasena) throw Error("Login Error")
        colaborador.validarContrasena(contrasena, (err, esValida) => {
            if (err || !esValida) throw Error("Login Error")
        })
        return res.status(200).json({ message: "Se ha iniciado sesion con exito", colaborador })
    } catch (error) {
        return res.status(400).json({ message: `Error: No se ha podido iniciar sesion` })
    }
}