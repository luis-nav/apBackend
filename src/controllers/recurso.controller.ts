import { Request, Response, RequestHandler } from "express";

import { ProyectoModel } from "../models/proyecto.model";

export const getRecursos: RequestHandler = async (req: Request, res: Response) => {
    const nombreProyecto = req.params.nombreProyecto;
    const proyecto = await ProyectoModel.findOne({ nombre: nombreProyecto });
    if (!proyecto) return res.status(400).json({ message: "Error: Project not found"});
    return res.status(200).json(proyecto.recursos);
}

export const addRecurso: RequestHandler = async (req: Request, res: Response) => {
    const nombreProyecto = req.params.nombreProyecto;
    const recurso = req.body;
    try {
        const proyecto = await ProyectoModel.findOneAndUpdate({ nombre: nombreProyecto }, { $push: { recursos: recurso }}).populate("tareas.responsable", ["nombre"]).populate("tareas.estado");
        if (!proyecto) return res.status(400).json({ message: "Error: Project not found "});
        return res.status(201).json({ message: "Resource created!", proyecto});  
    } catch (error) {
        return res.status(400).json({ message: `Error: The resource could not be created: ${error}` });;
    }
}

export const removeRecurso: RequestHandler = async (req: Request, res: Response) => {
    const nombreProyecto = req.params.nombreProyecto;
    const { nombre } = req.body
    try {
        const proyecto = await ProyectoModel.findOneAndUpdate({ nombre: nombreProyecto }, { $pull: { recursos: { nombre } }}).populate("tareas.responsable", ["nombre"]).populate("tareas.estado");
        if (!proyecto) return res.status(400).json({ message: "Error: Failed to delete project resource"});
        return res.status(201).json({ message: "Resource deleted!", proyecto});  
    } catch (error) {
        return res.status(400).json({ message: `Error: Resource not deleted: ${error}` });;
    }
}