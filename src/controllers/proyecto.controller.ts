import { Request, Response, RequestHandler, response } from "express";
import { ObjectId } from "mongoose";

import { ProyectoModel } from "../models/proyecto.model";
import { EstadoTareaModel } from '../models/estadoTarea.model';
import { ColaboradorModel } from "../models/colaborador.model";
import { enviarCambiosColaboradores } from "../utils/mail.functions";


const definirCambios = (cambiosProyecto: any, responsable: any) => {
    let cambioString = ""
    const cambioObj:{nombre?: any, presupuesto?: any, descripcion?: any, responsable?:any} = {}

    if (cambiosProyecto.nombre) {
        cambioString += "nombre, "
        cambioObj.nombre = cambiosProyecto.nombre;
    }
    if (cambiosProyecto.presupuesto) {
        cambioString += "presupuesto, "
        cambioObj.presupuesto = cambiosProyecto.presupuesto;
    }
    if (cambiosProyecto.descripcion) {
        cambioString += "descripcion, "
        cambioObj.descripcion = cambiosProyecto.descripcion;
    }
    if (responsable) {
        cambioString += "responsable, "
        cambioObj.responsable = responsable;
    }
    if (cambioString) {
        cambioString = cambioString.slice(0, -2)
    }
    return { cambioString, cambioObj }
}

export const getProyectos: RequestHandler = async (req: Request, res: Response) => {
    const proyectos = await ProyectoModel.find({})
        .populate({ path: "responsable", select: "nombre"})
        .populate("estado")
        .lean().exec();
    return res.status(200).json(proyectos);
}

export const getProyecto: RequestHandler = async (req: Request, res: Response) => {
    const nombre  = req.params.nombre;
    // findOne({ nombre: nombre }) <- En notacion de JS es lo mismo que hacer esto
    const proyecto = await ProyectoModel.findOne({ nombre })
        .populate({ path: "responsable", select: ["nombre", "cedula", "correo", "telefono"]})
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
        responsable.proyecto = proyecto;
        await responsable.save();
        return res.status(201).json({ message: "Proyecto creado!"});  
    } catch (error) {
        return res.status(400).json({ message: `Error: No se ha podido crear el proyecto: ${error}` });;
    }
}

export const actualizarProyecto: RequestHandler = async (req: Request, res: Response) => {
    const nombrePorBuscar  = req.params.nombre;
    const { nombre, presupuesto, descripcion, nombreResponsable } = req.body;

    const responsable = await ColaboradorModel.findOne({ nombre: nombreResponsable });
    const cambios = definirCambios( { nombre, presupuesto, descripcion }, responsable);

    try {
        const descripcionDeCambios = `Se cambio: ${cambios.cambioString}` 
        const nuevoProyecto = await ProyectoModel.findOneAndUpdate(
            { nombre: nombrePorBuscar }, 
            { ...cambios.cambioObj, $push: { cambios: { descripcion: descripcionDeCambios} }}
        ).populate("colaboradores");
        if (!nuevoProyecto) return res.status(400).json({message: "Error: No se pudo encontrar el proyecto!"});
        await nuevoProyecto.save();

        await enviarCambiosColaboradores(cambios.cambioString, nuevoProyecto);
    
        return res.status(200).json({ message: `Se ha actualizado el proyecto ${nuevoProyecto.nombre}` });
    } catch (error) {
        return res.status(400).json({ message: `Error: No se pudo editar el proyecto: ${error}`})
    }
}

export const actualizarEstadoProyecto: RequestHandler = async (req: Request, res: Response) => {
    const nombre  = req.params.nombre;
    const { nombreEstado } = req.body;
    try {
        const estado = await EstadoTareaModel.findOne({ nombre: nombreEstado });
        const proyecto = await ProyectoModel.findOneAndUpdate({ nombre }, { estado });
        if (!proyecto) return res.status(400).json({message: "Error: No se pudo encontrar el proyecto!"});
        await proyecto.save();
    
        return res.status(200).json({ message: `Se ha actualizado el estado del proyecto ${proyecto.nombre}` });
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