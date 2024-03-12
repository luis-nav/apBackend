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
    const { nombre } = req.body;
    // findOne({ nombre: nombre }) <- En notacion de JS es lo mismo que hacer esto
    const proyecto = await ProyectoModel.findOne({ nombre })
        .populate("responsable")
        .populate("estado")
        .populate({ path: "foro", populate: { path: "mensajes", populate: { path: "colaborador" } } })
        .populate({ path: "reuniones", populate: { path: "colaboradores" } })
        .lean().exec();
    return res.status(200).json(proyecto);
}

export const crearProyecto: RequestHandler = async (req: Request, res: Response) => {
    const { nombre, presupuesto, descripcion, fechaInicio, nombreResponsable } = req.body;
    const estado = await EstadoTareaModel.findOne({ nombre: "Iniciando" });
    const responsable = await ColaboradorModel.findOne({ nombre: nombreResponsable });
    //TODO: Castear fechaInicio string -> date
    const proyecto = new ProyectoModel({
        nombre, 
        presupuesto, 
        descripcion,
        estado,
        responsable,
        fechaInicio
    });
    await proyecto.save();

    return res.status(201).json({ message: "Proyecto creado!"})
}