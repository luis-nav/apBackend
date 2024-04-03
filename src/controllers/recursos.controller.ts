import { Request, Response, RequestHandler } from "express";

import { ProyectoModel } from "../models/proyecto.model";

export const getRecursos: RequestHandler = async (req: Request, res: Response) => {
    const nombreProyecto = req.params.nombreProyecto;
    const proyecto = await ProyectoModel.findOne({ nombre: nombreProyecto });
    if (!proyecto) return res.status(400).json({ message: "Error: Couldn't find project"});
    return res.status(200).json(proyecto.recursos);
}