import { Request, Response, RequestHandler } from "express";

import { ProyectoModel } from "../models/proyecto.model";
import { ForoModel } from "../models/foro.model";

export const getForoProyecto: RequestHandler = async (req: Request, res: Response) => {
    const nombreProyecto  = req.params.proyecto;
    const proyecto = await ProyectoModel.findOne({ nombre: nombreProyecto })
        .populate("foro")
        .populate( { path: "foro.mensajes", populate: { path: "colaborador", select: "nombre" }})
    if (!proyecto) { return res.status(404).json({ message: "Error: Project not found" }) }
    if (!proyecto.foro) { return res.status(404).json({ message: "Error: The selected project does not have a forum" }) }
    return res.status(200).json(proyecto.foro);
}

export const getForoGeneral: RequestHandler = async (req: Request, res: Response) => {
    const foroGeneral = await ForoModel.findOne({ esDeProyecto: false });;
    return res.status(200).json(foroGeneral);
}

export const crearForoProyecto: RequestHandler = async (req: Request, res: Response) => {
    const nombreProyecto  = req.params.proyecto;
    const proyecto = await ProyectoModel.findOne({ nombre: nombreProyecto })
    if (!proyecto) { return res.status(404).json({ message: "Error: Project not found" }) }
    if (proyecto.foro) { return res.status(400).json({ message: "Error: The project already has a forum" })}
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
        return res.status(201).json({ message: "Forum created!"});  
    } catch (error) {
        return res.status(400).json({ message: `Error: Could not create forum: ${error}` });
    }
    
}