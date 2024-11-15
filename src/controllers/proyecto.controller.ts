import { Request, Response, RequestHandler, response } from "express";
import { ObjectId } from "mongoose";

import { ProyectoModel } from "../models/proyecto.model";
import { EstadoTareaModel } from '../models/estadoTarea.model';
import { ColaboradorModel } from "../models/colaborador.model";
import { enviarAsignacionProyecto, enviarCambiosColaboradores } from "../utils/mail.functions";
import { ForoModel } from "../models/foro.model";


const definirCambios = (cambiosProyecto: any, responsable: any) => {
    let cambioString = ""
    const cambioObj:{nombre?: any, presupuesto?: any, descripcion?: any, responsable?:any, fechaFinal?:any, estado?:any} = {}

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
    if (cambiosProyecto.fechaFinal) {
        cambioString += "fecha final, "
        cambioObj.fechaFinal = cambiosProyecto.fechaFinal;
    }
    if (cambiosProyecto.estado) {
        cambioString += "estado, "
        cambioObj.estado = cambiosProyecto.estado
    }
    if (cambioString) {
        cambioString = cambioString.slice(0, -2)
    }
    return { cambioString, cambioObj }
}

export const getProyectos: RequestHandler = async (req: Request, res: Response) => {
    const proyectos = await ProyectoModel.find({})
        .populate({ path: "responsable", select: "correo"});
    const proyectosFormatted = proyectos.map(proyecto => ({
            _id: proyecto._id,
            nombre: proyecto.nombre,
            presupuesto: proyecto.presupuesto,
            descripcion: proyecto.descripcion,
            fechaInicio: proyecto.fechaInicio,
            estado: proyecto.estado,
            responsable: proyecto.responsable.correo,
            reuniones: proyecto.reuniones,
            tareas: proyecto.tareas,
            cambios: proyecto.cambios,
            recursos: proyecto.recursos,
            fechaFin: proyecto.fechaFinal,
            tieneForo: !!proyecto.foro
        }))
    return res.status(200).json(proyectosFormatted);
}

export const getProyecto: RequestHandler = async (req: Request, res: Response) => {
    const nombre  = req.params.nombre;
    // findOne({ nombre: nombre }) <- En notacion de JS es lo mismo que hacer esto
    const proyecto = await ProyectoModel.findOne({ nombre })
        .populate({ path: "responsable", select: ["nombre", "cedula", "correo", "telefono", "departamento"]})
        .populate({ path: "foro", populate: { path: "mensajes", populate: { path: "colaborador" } } })
        .populate({ path: "reuniones", populate: { path: "colaboradores" } });
    if (!proyecto) { return res.status(404).json({ message: "Error: Project not found" }) }
    const colaboradores = await ColaboradorModel.find({ admin: false, proyecto });
    const proyectoFormatted = {
        _id: proyecto._id,
        nombre: proyecto.nombre,
        presupuesto: proyecto.presupuesto,
        descripcion: proyecto.descripcion,
        fechaInicio: proyecto.fechaInicio,
        estado: proyecto.estado,
        responsable: proyecto.responsable.correo,
        reuniones: proyecto.reuniones,
        tareas: proyecto.tareas,
        cambios: proyecto.cambios,
        recursos: proyecto.recursos,
        fechaFin: proyecto.fechaFinal,
        tieneForo: !!proyecto.foro,
        colaboradores
    }
    return res.status(200).json(proyectoFormatted);
}

export const crearProyecto: RequestHandler = async (req: Request, res: Response) => {
    const { nombre, presupuesto, descripcion, fechaInicio, correoResponsable, fechaFinal } = req.body;
    const estado = "Active";
    const responsable = await ColaboradorModel.findOne({ correo: correoResponsable });
    if (responsable === null) {
        return res.status(404).json({ message: "Error: The name of the person responsible is not valid"})
    }
    try {
        const proyecto = new ProyectoModel({
            nombre, 
            presupuesto, 
            descripcion,
            estado,
            responsable,
            fechaInicio,
            fechaFinal
        });
        await proyecto.save();
        responsable.proyecto = proyecto;
        await responsable.save();
        await enviarAsignacionProyecto(responsable, proyecto);
        return res.status(201).json({ message: "Project created!"});  
    } catch (error:any) {
        if (error.code === 11000) return res.status(400).json({ message: `Error: There is already a project with the name ${nombre}`});
        else return res.status(400).json({ message: `Error: Could not create project: ${error}` });;
    }
}

export const actualizarProyecto: RequestHandler = async (req: Request, res: Response) => {
    const nombrePorBuscar  = req.params.nombre;
    const { nombre, presupuesto, descripcion, correoResponsable, fechaFinal, estado } = req.body;

    const responsable = await ColaboradorModel.findOne({ correo: correoResponsable });
    const cambios = definirCambios( { nombre, presupuesto, descripcion, fechaFinal, estado }, responsable);
    const cambiosObj = Object.fromEntries(Object.entries({ nombre, presupuesto, descripcion, fechaFinal, estado, responsable }).filter(([_, value]) => value !== undefined).filter(([_, value]) => value !== null).filter(([_, value]) => value !== ""))
    try {
        const descripcionDeCambios = `Changes: ${cambios.cambioString}` 
        const nuevoProyecto = await ProyectoModel.findOneAndUpdate(
            { nombre: nombrePorBuscar }, 
            { 
                ...cambiosObj, 
                $push: { cambios: { 
                    titulo: "General changes to proyecto",
                    descripcion: descripcionDeCambios,
                    aprobadoPor: null 
                } }}
        );
        if (!nuevoProyecto) return res.status(400).json({message: "Error: The project could not be found"});

        await enviarCambiosColaboradores(cambios.cambioString, nuevoProyecto);
    
        return res.status(200).json({ message: `The project ${nuevoProyecto.nombre} has been updated` });
    } catch (error) {
        return res.status(400).json({ message: `${error}`})
    }
}

export const actualizarEstadoProyecto: RequestHandler = async (req: Request, res: Response) => {
    const nombre  = req.params.nombre;
    const { nombreEstado } = req.body;
    try {
        const proyecto = await ProyectoModel.findOneAndUpdate({ nombre }, { estado: nombreEstado });
        if (!proyecto) return res.status(400).json({message: "Error: The project could not be found"});
        await proyecto.save();
    
        return res.status(200).json({ message: `Project status updated ${proyecto.nombre}` });
    } catch (error) {
        return res.status(400).json({ message: `Error: Could not edit project: ${error}`})
    }
}

export const eliminarProyecto: RequestHandler = async (req:Request, res:Response) => {
    const nombre  = req.params.nombre;
    const proyecto = await ProyectoModel.findOne({ nombre });
    try {
        if (proyecto && proyecto.foro) { await ForoModel.findByIdAndDelete(proyecto.foro); }
        await ColaboradorModel.updateMany({ proyecto }, { proyecto: null })
        await ProyectoModel.findOneAndDelete({ nombre });
        return res.status(200).json({ message: "The project has been deleted successfully" });
    } catch (error) {
        return res.status(200).json({ message: `Error: Could not delete project: ${error}` })
    }
}

export const addColab: RequestHandler = async (req: Request, res: Response) => {
    const nombre = req.params.nombre;
    const { correoColab } = req.body;

    
    const colab = await ColaboradorModel.findOne({ correo: correoColab });
     
    if (!colab) { return res.status(404).json({ message: "Error: Collaborator not found" })}

    if (nombre === "Free") {
        try {
            const update = await ColaboradorModel.findOneAndUpdate({ correo: correoColab }, { proyecto: null });
            if (!update) { return res.status(400).json({ message: "Error: Couldn't asign project" }) }
            return res.status(200).json({ message: `The collaborator ${update.nombre} is now free` });
        } catch (error) {
            return res.status(400).json({ message: `Error: Couldn't free collaborator: ${error}` });
        }
    }
    
    const proyecto = await ProyectoModel.findOne({ nombre });

    if (!proyecto) { return res.status(404).json({ message: "Error: Project not found" })}
    
    if (colab.proyecto) { return res.status(400).json({ message: "Error: Collaborator already has an assigned proyect"})}
    
    
    try {
        
        const update = await ColaboradorModel.findOneAndUpdate({ correo: correoColab }, { proyecto });
        if (!update) { return res.status(400).json({ message: "Error: Couldn't asign project" }) }
        await enviarAsignacionProyecto(update, proyecto);
        return res.status(200).json({ message: `The project was asigned to the collaborator ${update.nombre}` });
    } catch (error) {
        return res.status(400).json({ message: `Error: Couldn't asign project: ${error}` });
    }
}

export const removeColab: RequestHandler = async (req: Request, res: Response) => {
    const nombre = req.params.nombreProyecto;
    const correo = req.params.correoColab

    const proyecto = await ProyectoModel.findOne({ nombre });

    if (!proyecto) { return res.status(404).json({ message: "Error: Project not found" })}

    const colab = await ColaboradorModel.findOne({ correo });

    if (!colab) { return res.status(404).json({ message: "Error: Collaborator not found" })}

    try {
        const update = await ColaboradorModel.findOneAndUpdate({ correo }, { proyecto: null });
        if (!update) { return res.status(400).json({ message: "Error: Couldn't remove collaborator from project" }) }
        return res.status(200).json({ message: `The collaborator ${update.nombre} has been successfully removed from the project ${proyecto.nombre}` });
    } catch (error) {
        return res.status(400).json({ message: `Error: Couldn't remove collaborator from project: ${error}` });
    }
}

export const getColabs: RequestHandler = async (req: Request, res: Response) => {
    const nombre  = req.params.nombre;
    const proyecto = await ProyectoModel.findOne({ nombre });
    if (!proyecto) { return res.status(404).json({ message: "Error: Project not found" }) }
    const colaboradores = await ColaboradorModel.find({ proyecto, estado: true });
    return res.status(200).json(colaboradores)
}