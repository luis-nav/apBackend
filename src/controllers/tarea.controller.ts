import { Request, Response, RequestHandler } from "express";

import { ColaboradorModel } from "../models/colaborador.model";
import { EstadoTareaModel } from "../models/estadoTarea.model";
import { ProyectoModel } from "../models/proyecto.model";

export const getTareas: RequestHandler = async (req: Request, res: Response) => {
    const nombreProyecto = req.params.nombreProyecto;
    const proyecto = await ProyectoModel.findOne({ nombre: nombreProyecto }).populate("tareas.responsable");
    if (!proyecto) return res.status(400).json({ message: "Error: Project not found"});
    const tareasFormatted = proyecto.tareas.map(tarea => ({
        nombre: tarea.nombre,
        descripcion: tarea.descripcion,
        storyPoints: tarea.storyPoints,
        responsable: tarea.responsable.correo,
        estado: tarea.estado,
        fechaInicio: tarea.fechaInicio,
        fechaFinal: tarea.fechaFinal
    }))
    return res.status(200).json(tareasFormatted);
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

    const estado = "Por hacer";
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
    const { nombreNuevo, storyPoints, nombreResponsable, estadoTarea, descripcion } = req.body;
    let fechaFinal = null
    if (estadoTarea === "Done") { fechaFinal = Date.now() }
    const responsable = await ColaboradorModel.findOne({ nombre: nombreResponsable });
    if (!responsable) { return res.status(404).json({ message: "Error: The name of the person responsible is not valid" }) }
    const tarea = Object.fromEntries(Object.entries({ nombre: nombreNuevo, storyPoints, responsable, estadoTarea, fechaFinal, descripcion }).filter(([_, value]) => value !== undefined).filter(([_, value]) => value !== null).filter(([_, value]) => value !== ""));
    
    try {
        const update = await ProyectoModel.updateOne(
            { nombre: nombreProyecto, "tareas.nombre": nombre }, 
            { $set: { "tareas.$": tarea } });
        if (!update) return res.status(400).json({ message: "Error: Failed to update task"});
        const proyecto = await ProyectoModel.findOne( {nombre: nombreProyecto })
        .populate("tareas.responsable", ["nombre"])
        return res.status(201).json({ message: "Task created!", proyecto});  
    } catch (error) {
        return res.status(400).json({ message: `Error: Failed to update task: ${error}` });;
    }
}

export const eliminarTarea: RequestHandler = async (req: Request, res: Response) => {
    const nombreProyecto = req.params.nombreProyecto;
    const nombre = req.params.nombre

    try {
        const proyecto = await ProyectoModel.findOneAndUpdate({ nombre: nombreProyecto }, { $pull: { tareas: { nombre } }}).populate("tareas.responsable", ["nombre"]);
        if (!proyecto) return res.status(400).json({ message: "Error: Failed to delete project task"});
        return res.status(201).json({ message: "Task deleted!", proyecto});  
    } catch (error) {
        return res.status(400).json({ message: `Error: Task not deleted: ${error}` });;
    }
}