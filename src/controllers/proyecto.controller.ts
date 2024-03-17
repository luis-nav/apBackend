import { Request, Response, RequestHandler } from "express";

import { ProyectoModel } from "../models/proyecto.model";
import { EstadoTareaModel } from '../models/estadoTarea.model';
import { ColaboradorModel } from "../models/colaborador.model";


export const getProyectos: RequestHandler = async (req: Request, res: Response) => {
    const proyectos = await ProyectoModel.find({})
        .populate("responsable")
        .populate("estado")
        .lean().exec();
    return res.status(200).json(proyectos);
}

export const getProyecto: RequestHandler = async (req: Request, res: Response) => {
    const nombre  = req.params.nombre;
    // findOne({ nombre: nombre }) <- En notacion de JS es lo mismo que hacer esto
    const proyecto = await ProyectoModel.findOne({ nombre })
        .populate("responsable")
        .populate("estado")
        .populate({ path: "foro", populate: { path: "mensajes", populate: { path: "colaborador" } } })
        .populate({ path: "reuniones", populate: { path: "colaboradores" } })
        .lean().exec();
    if (proyecto === null) {
        return res.status(404).json({ message: "Error: No se ha encontrado el proyecto" });
    }
    return res.status(200).json(proyecto);
}

export const crearProyecto: RequestHandler = async (req: Request, res: Response) => {
    const { nombre, presupuesto, descripcion, fechaInicio, nombreResponsable } = req.body;
    const estado = await EstadoTareaModel.findOne({ nombre: "Por hacer" });
    const responsable = await ColaboradorModel.findOne({ nombre: nombreResponsable });
    if (responsable === null) {
        return res.status(404).json({ message: "Error: El nombre del responsable no es valido"})
    }
    try {
        const proyecto = new ProyectoModel({
            nombre, 
            presupuesto, 
            descripcion,
            estado,
            responsable,
            fechaInicio
        });
        await proyecto.save();
        return res.status(201).json({ message: "Proyecto creado!"});  
    } catch (error) {
        return res.status(400).json({ message: `Error: No se ha podido crear el proyecto: ${error}` });;
    }
}

export const actualizarProyecto: RequestHandler = async (req: Request, res: Response) => {
    const nombrePorBuscar  = req.params.nombre;
    const { nombre, presupuesto, descripcion, fechaInicio, nombreResponsable } = req.body;
    const responsable = await ColaboradorModel.findOne({ nombre: nombreResponsable });
    try {
        const nuevoProyecto = await ProyectoModel.findOneAndUpdate({ nombre: nombrePorBuscar }, {
            nombre,
            presupuesto, 
            descripcion,
            responsable,
            fechaInicio
        });
        if (!nuevoProyecto) return res.status(400).json({message: "Error: No se pudo encontrar el proyecto!"});
        
        await nuevoProyecto.save();
    
        return res.status(200).json({ message: `Se ha actualizado el proyecto ${nuevoProyecto.nombre}` });
    } catch (error) {
        return res.status(400).json({ message: `Error: No se pudo editar el proyecto: ${error}`})
    }
}

export const eliminarProyecto: RequestHandler = async (req:Request, res:Response) => {
    const nombre  = req.params.nombre;
    
    try {
        await ProyectoModel.findOneAndDelete({ nombre });
        return res.status(200).json({ message: "Se ha eliminado el proyecto con exito" });
    } catch (error) {
        return res.status(200).json({ message: `Error: No se ha podido eliminar el proyecto: ${error}` })
    }
}