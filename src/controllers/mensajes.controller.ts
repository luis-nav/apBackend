import { Request, Response, RequestHandler } from "express";
import { ProyectoModel } from "../models/proyecto.model";
import { ColaboradorModel } from "../models/colaborador.model";
import { ForoModel } from "../models/foro.model";

export const postearMensaje: RequestHandler = async (req: Request, res: Response) => {
    const { nombreColaborador, mensaje } = req.body;
    const foroGeneral = await ForoModel.findOne({ esDeProyecto: false });
    const colaborador = await ColaboradorModel.findOne({ nombre:nombreColaborador });
    if (!colaborador) { return res.status(400).json({ message: "Error: Collaborator name is not valid" }) }
    
    try {
        const foroActualizado = await ForoModel.findOneAndUpdate({ esDeProyecto: false }, { $push: { mensajes: {mensaje, colaborador}}});
        if (!foroActualizado) { return res.status(400).json({ message: "Error: Could not post message" })}
        return res.status(200).json(foroGeneral);
    } catch (error) {
        return res.status(400).json({ message: `Error: Could not post message: ${error}` })   
    }

} 

export const postearMensajeProyecto: RequestHandler = async (req: Request, res: Response) => {
    const nombreProyecto  = req.params.proyecto;
    const { nombreColaborador, mensaje } = req.body;
    const proyecto = await ProyectoModel.findOne({ nombre: nombreProyecto })
        .populate("foro");
    if (!proyecto) { return res.status(404).json({ message: "Error: Project not found" }) }
    if (!proyecto.foro) { return res.status(404).json({ message: "El proyecto seleccionado no cuenta con foro" }) }

    const colaborador = await ColaboradorModel.findOne({ nombre:nombreColaborador });
    if (!colaborador) { return res.status(400).json({ message: "Error: The selected project does not have a forum" }) }
    try {
        const proyectoActualizado = await ProyectoModel.findOneAndUpdate({ nombre: nombreProyecto }, { $push: { "foro.mensajes": { mensaje, colaborador } } });      
        if (!proyectoActualizado) { return res.status(400).json({ message: "Error: Could not post message" })}
        return res.status(200).json(proyectoActualizado.foro);
    } catch (error) {
        return res.status(400).json({ message: `Error: Could not post message: ${error}` })   
    }
}