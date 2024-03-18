import { Request, Response, RequestHandler } from "express";

import { TareaModel } from "../models/tarea.model";
import { ColaboradorModel } from "../models/colaborador.model";
import { EstadoTareaModel } from "../models/estadoTarea.model";

export const getTareas: RequestHandler = async (req: Request, res: Response) => {
    const tareas = await TareaModel.find({})
        .populate({ path: "responsable", select: "nombre"})
        .populate("estado")
        .lean().exec();
    return res.status(200).json(tareas);
}

export const getTarea: RequestHandler = async (req: Request, res: Response) => {
    const nombre  = req.params.nombre;
    const tarea = await TareaModel.findOne({ nombre })
        .populate({ path: "responsable", select: ["nombre", "cedula", "correo", "telefono"]})
        .populate("estado")
        .lean().exec();
    if (tarea === null) {
        return res.status(404).json({ message: "Error: No se ha encontrado la tarea" });
    }
    return res.status(200).json(tarea);
}

export const crearTarea: RequestHandler = async (req: Request, res: Response) => {
    const { nombre, storyPoints, nombreResponsable } = req.body;
    const estado = await EstadoTareaModel.findOne({ nombre: "Por hacer" });
    const responsable = await ColaboradorModel.findOne({ nombre: nombreResponsable });
    if (responsable === null) {
        return res.status(404).json({ message: "Error: El nombre del responsable no es válido"})
    }
    try {
        const tarea = new TareaModel({
            nombre,
            storyPoints, 
            responsable,
            estado
        });
        await tarea.save();
        return res.status(201).json({ message: "Tarea creada!"});  
    } catch (error) {
        return res.status(400).json({ message: `Error: No se ha podido crear la tarea: ${error}` });;
    }
}

export const actualizarTarea: RequestHandler = async (req: Request, res: Response) => {
    const nombrePorBuscar  = req.params.nombre;
    const { nombre, storyPoints, nombreResponsable, estado } = req.body;
    const responsable = await ColaboradorModel.findOne({ nombre: nombreResponsable });
    try {
        const nuevaTarea = await TareaModel.findOneAndUpdate({ nombre: nombrePorBuscar }, {
            nombre,
            storyPoints, 
            responsable,
            estado
        });
        if (!nuevaTarea) return res.status(400).json({message: "Error: No se pudo encontrar la tarea!"});
        
        await nuevaTarea.save();
    
        return res.status(200).json({ message: `Se ha actualizado la tarea ${nuevaTarea.nombre}` });
    } catch (error) {
        return res.status(400).json({ message: `Error: No se pudo editar la tarea: ${error}`})
    }
}

export const eliminarTarea: RequestHandler = async (req:Request, res:Response) => {
    const nombre  = req.params.nombre;
    
    try {
        await TareaModel.findOneAndDelete({ nombre });
        return res.status(200).json({ message: "Se ha eliminado la tarea con éxito" });
    } catch (error) {
        return res.status(400).json({ message: `Error: No se ha podido eliminar la tarea: ${error}` })
    }
}