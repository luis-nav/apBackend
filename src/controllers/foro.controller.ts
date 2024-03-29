import { Request, Response, RequestHandler } from "express";

import { ProyectoModel } from "../models/proyecto.model";
import { ForoModel } from "../models/foro.model";

export const getForoProyecto: RequestHandler = async (req: Request, res: Response) => {
    const nombreProyecto  = req.params.proyecto;
    const proyecto = await ProyectoModel.findOne({ nombreProyecto })
        .populate("foro")
        .populate( { path: "foro.mensajes", populate: { path: "colaborador", select: "nombre" }})
    if (!proyecto) { return res.status(404).json({ message: "Error: No se ha encontrado el proyecto" }) }
    if (!proyecto.foro) { return res.status(404).json({ message: "El proyecto seleccionado no cuenta con foro" }) }
    return res.status(200).json(proyecto.foro);
}

export const getForoGeneral: RequestHandler = async (req: Request, res: Response) => {
    const foroGeneral = await ForoModel.find({ esDeProyecto: false }).lean().exec();
    return res.status(200).json(foroGeneral);
}

export const crearForoProyecto: RequestHandler = async (req: Request, res: Response) => {
    const nombreProyecto  = req.params.proyecto;
    const proyecto = await ProyectoModel.findOne({ nombreProyecto })
    if (!proyecto) { return res.status(404).json({ message: "Error: No se ha encontrado el proyecto" }) }
    if (proyecto.foro) { return res.status(400).json({ message: "Error: El proyecto ya cuenta con un foro" })}
    const esDeProyecto = true;
    const mensajes:any[] = [];
    try {
        const foro = new ForoModel({
            esDeProyecto,
            mensajes
        });
        await foro.save();
        proyecto.foro = foro;
        await proyecto.save();
        return res.status(201).json({ message: "Foro creado!"});  
    } catch (error) {
        return res.status(400).json({ message: `Error: No se ha podido crear el foro: ${error}` });
    }
    
}