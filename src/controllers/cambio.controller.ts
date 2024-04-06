import { RequestHandler, Request, Response } from "express";

import { ProyectoModel } from "../models/proyecto.model";
import { ColaboradorModel } from "../models/colaborador.model";

export const getCambios: RequestHandler = async (req: Request, res: Response) => {
    const nombreProyecto = req.params.nombreProyecto;
    const proyecto = await ProyectoModel.findOne({ nombre: nombreProyecto }).populate("cambios.aprobadoPor");
    if (!proyecto) return res.status(400).json({ message: "Error: Project not found"});
    return res.status(200).json(proyecto.cambios);
}

export const addCambio: RequestHandler = async (req: Request, res: Response) => {
    const nombreProyecto = req.params.nombreProyecto;
    const { titulo, descripcion, aprobadoPorNombre } = req.body;

    const aprobadoPor = await ColaboradorModel.findOne({ nombre: aprobadoPorNombre });
    if (!aprobadoPor) { return res.status(404).json({ message: "Error: The name of the person responsible is not valid" }) }
    const cambio = { titulo, descripcion, aprobadoPor };
    try {
        const proyecto = await ProyectoModel.findOneAndUpdate({ nombre: nombreProyecto }, { $push: { cambios: cambio }}).populate("tareas.responsable", ["nombre"]).populate("tareas.estado").populate("cambios.aprobadoPor");
        if (!proyecto) return res.status(400).json({ message: "Error: Project not found "});
        return res.status(201).json({ message: "Change registered!", proyecto});  
    } catch (error) {
        return res.status(400).json({ message: `Error: The task could not be created: ${error}` });;
    }
}