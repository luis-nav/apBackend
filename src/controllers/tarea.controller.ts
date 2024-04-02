import { Request, Response, RequestHandler } from "express";

import { ColaboradorModel } from "../models/colaborador.model";
import { EstadoTareaModel } from "../models/estadoTarea.model";
import { ProyectoModel } from "../models/proyecto.model";

export const getTareas: RequestHandler = async (req: Request, res: Response) => {
    const nombreProyecto = req.params.nombreProyecto;
    const proyecto = await ProyectoModel.findOne({ nombre: nombreProyecto }).populate("tareas.responsable").populate("tareas.estado");
    if (!proyecto) return res.status(400).json({ message: "Error: Project not found"});
    return res.status(200).json(proyecto.tareas);
}

// export const getTarea: RequestHandler = async (req: Request, res: Response) => {
//     const nombre  = req.params.nombre;
//     const tarea = await TareaModel.findOne({ nombre })
//         .populate({ path: "responsable", select: ["nombre", "cedula", "correo", "telefono"]})
//         .populate("estado")
//         .lean().exec();
//     if (tarea === null) {
//         return res.status(404).json({ message: "Error: Task not found" });
//     }
//     return res.status(200).json(tarea);
// }

export const crearTarea: RequestHandler = async (req: Request, res: Response) => {
    const nombreProyecto = req.params.nombreProyecto;
    const { nombre, storyPoints, nombreResponsable } = req.body;

    const estado = await EstadoTareaModel.findOne({ nombre: "Por hacer" });
    const responsable = await ColaboradorModel.findOne({ nombre: nombreResponsable });
    if (responsable === null) {
        return res.status(404).json({ message: "Error: The name of the person responsible is not valid"})
    }
    const tarea = { nombre, storyPoints, responsable, estado };
    try {
        const proyecto = await ProyectoModel.findOneAndUpdate({ nombre: nombreProyecto }, { $push: { tareas: tarea }}).populate("tareas.responsable", ["nombre"]).populate("tareas.estado");
        if (!proyecto) return res.status(400).json({ message: "Error: Project not found "});
        return res.status(201).json({ message: "Task created!", proyecto});  
    } catch (error) {
        return res.status(400).json({ message: `Error: The task could not be created: ${error}` });;
    }
}

export const actualizarTarea: RequestHandler = async (req: Request, res: Response) => {
    const nombreProyecto = req.params.nombreProyecto;
    const nombre = req.params.nombre
    const { nombreNuevo, storyPoints, nombreResponsable, estadoTarea } = req.body;

    const estado = await EstadoTareaModel.findOne({ nombre: estadoTarea });
    if (!estado) { return res.status(400).json({ message: "Error: Invalid task status" }) }
    const responsable = await ColaboradorModel.findOne({ nombre: nombreResponsable });
    if (!responsable) { return res.status(404).json({ message: "Error: The name of the person responsible is not valid" }) }
    const tarea = { nombre: nombreNuevo, storyPoints, responsable, estado };
    
    try {
        const update = await ProyectoModel.updateOne(
            { nombre: nombreProyecto, "tareas.nombre": nombre }, 
            { $set: { "tareas.$": tarea } });
        if (!update) return res.status(400).json({ message: "Error: Failed to update task"});
        const proyecto = await ProyectoModel.findOne( {nombre: nombreProyecto })
        .populate("tareas.responsable", ["nombre"])
        .populate("tareas.estado");
        return res.status(201).json({ message: "Task created!", proyecto});  
    } catch (error) {
        return res.status(400).json({ message: `Error: Failed to update task: ${error}` });;
    }
}

export const eliminarTarea: RequestHandler = async (req: Request, res: Response) => {
    const nombreProyecto = req.params.nombreProyecto;
    const nombre = req.params.nombre

    try {
        const proyecto = await ProyectoModel.findOneAndUpdate({ nombre: nombreProyecto }, { $pull: { tareas: { nombre } }}).populate("tareas.responsable", ["nombre"]).populate("tareas.estado");
        if (!proyecto) return res.status(400).json({ message: "Error: Failed to delete project task"});
        return res.status(201).json({ message: "Task deleted!", proyecto});  
    } catch (error) {
        return res.status(400).json({ message: `Error: Task not deleted: ${error}` });;
    }
}