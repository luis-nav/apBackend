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