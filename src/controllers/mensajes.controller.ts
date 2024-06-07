import { Request, Response, RequestHandler } from "express";
import { ProyectoModel } from "../models/proyecto.model";
import { ColaboradorModel } from "../models/colaborador.model";
import { ForoModel } from "../models/foro.model";

export const postearMensaje: RequestHandler = async (req: Request, res: Response) => {
    const { nombreColaborador, mensaje } = req.body;
    const colaborador = await ColaboradorModel.findOne({ nombre:nombreColaborador });
    if (!colaborador) { return res.status(400).json({ message: "Error: Collaborator name is not valid" }) }
    
    try {
        const foroActualizado = await ForoModel.findOneAndUpdate({ esDeProyecto: false }, { $push: { mensajes: {mensaje, colaborador}}}, {new:true})
            .populate({ path: "mensajes.colaborador", model: "Colaborador"})
            .populate({ path: "mensajes.respuestas.colaborador", model: "Colaborador"});
        if (!foroActualizado) { return res.status(400).json({ message: "Error: Could not post message" })}
        return res.status(200).json(foroActualizado);
    } catch (error) {
        return res.status(400).json({ message: `Error: Could not post message: ${error}` })   
    }

} 

export const postearMensajeProyecto: RequestHandler = async (req: Request, res: Response) => {
    const nombreProyecto  = req.params.proyecto;
    const { nombreColaborador, mensaje } = req.body;
    const proyecto = await ProyectoModel.findOne({ nombre: nombreProyecto });
    if (!proyecto) { return res.status(404).json({ message: "Error: Project not found" }) }
    if (!proyecto.foro) { return res.status(404).json({ message: "Error: The selected proyect does not have a forum" }) }

    const colaborador = await ColaboradorModel.findOne({ nombre:nombreColaborador });
    if (!colaborador) { return res.status(400).json({ message: "Error: The selected project does not have a forum" }) }
    try {
        const foroActualizado = await ForoModel.findOneAndUpdate({ _id: proyecto.foro }, { $push: { mensajes: { mensaje, colaborador } } }, {new:true})
            .populate({ path: "mensajes.colaborador", model: "Colaborador"})
            .populate({ path: "mensajes.respuestas.colaborador", model: "Colaborador"});
        if (!foroActualizado) { return res.status(400).json({ message: "Error: Could not post message" })}
        return res.status(200).json(foroActualizado);
    } catch (error) {
        return res.status(400).json({ message: `Error: Could not post message: ${error}` })   
    }
}

export const postearRespuesta: RequestHandler = async (req:Request, res: Response) => {
    const _id = req.params._id;
    const { nombreColaborador, mensaje } = req.body;
    const colaborador = await ColaboradorModel.findOne({ nombre:nombreColaborador });
    if (!colaborador) { return res.status(400).json({ message: "Error: Collaborator name is not valid" }) }

    try {
        const foroActualizado = await ForoModel.findOneAndUpdate({ esDeProyecto: false, "mensajes._id": _id }, { $push: { "mensajes.$.respuestas": {mensaje, colaborador}}}, {new:true})
            .populate({ path: "mensajes.colaborador", model: "Colaborador"})
            .populate({ path: "mensajes.respuestas.colaborador", model: "Colaborador"});
        if (!foroActualizado) { return res.status(400).json({ message: "Error: Could not post reply" })}
        return res.status(200).json(foroActualizado);
    } catch (error) {
        return res.status(400).json({ message: `Error: Could not post reply: ${error}`});
    }
}

export const postearRespuestaProyecto: RequestHandler = async (req: Request, res: Response) => {
    const { nombreProyecto, _id } = req.params;
    const { nombreColaborador, mensaje } = req.body;
    const proyecto = await ProyectoModel.findOne({ nombre: nombreProyecto });
    if (!proyecto) { return res.status(404).json({ message: "Error: Project not found" }) }
    if (!proyecto.foro) { return res.status(404).json({ message: "Error: The selected proyect does not have a forum" }) }
    const colaborador = await ColaboradorModel.findOne({ nombre:nombreColaborador });
    if (!colaborador) { return res.status(400).json({ message: "Error: Collaborator name is not valid" }) }
    try {
        const foroActualizado = await ForoModel.findOneAndUpdate({ _id: proyecto.foro, "mensajes._id": _id }, { $push: { "mensajes.$.respuestas": {mensaje, colaborador}}}, {new:true})
        .populate({ path: "mensajes.colaborador", model: "Colaborador"})
        .populate({ path: "mensajes.respuestas.colaborador", model: "Colaborador"});
        if (!foroActualizado) { return res.status(400).json({ message: "Error: Could not post reply" })}
        return res.status(200).json(foroActualizado);
    } catch (error) {
        return res.status(400).json({ message: `Error: Could not post reply: ${error}`});
    }
}