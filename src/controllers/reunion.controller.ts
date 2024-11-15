import { Request, Response, RequestHandler } from "express";

import { ReunionModel } from "../models/reunion.model";
import { ColaboradorModel } from "../models/colaborador.model";
import { ProyectoModel } from "../models/proyecto.model";
import { enviarAvisoReunion } from "../utils/mail.functions";

export const getReuniones: RequestHandler = async (req: Request, res: Response) => {
    const nombreProyecto  = req.params.nombreProyecto;
    const proyecto = await ProyectoModel.findOne({ nombre: nombreProyecto }).populate("reuniones")
    if (!proyecto) { return res.status(404).json({ message: "Error: Project not found" }) }
    return res.status(200).json(proyecto.reuniones);
}

export const crearReunion: RequestHandler = async (req: Request, res: Response) => {
    const nombreProyecto  = req.params.nombreProyecto;
    const { fecha, temaReunion, medioReunion, descripcion } = req.body;
    const proyecto = await ProyectoModel.findOne({ nombre: nombreProyecto });
    if (!proyecto) { return res.status(404).json({ message: "Error: Project not found" }) }
    try {
        const reunion = new ReunionModel({
            fecha, 
            temaReunion, 
            medioReunion, 
            descripcion
        });
        const savedReunion = await reunion.save();
        // @ts-ignore
        proyecto.reuniones.push(savedReunion);
        await proyecto?.save();
        await enviarAvisoReunion(reunion.temaReunion, fecha, proyecto);
        return res.status(201).json({ message: "Meeting created!", _id: savedReunion._id});
    } catch (error) {
        return res.status(400).json({ message: `Error: Could not create meeting: ${error}` });;
    }

}

export const eliminarReunion: RequestHandler = async (req:Request, res:Response) => {
    const idReunion = req.params.idReunion;
    const nombreProyecto = req.params.nombreProyecto;
    const proyecto = await ProyectoModel.findOne({ nombre: nombreProyecto });
    if (proyecto === null) {
        return res.status(404).json({ message: "Error: Project not found" });
    }
    else {
        // @ts-ignore
        const reunion = proyecto.reuniones.findIndex(reunion => reunion._id.toString() === idReunion);
        if (reunion === -1) {
            return res.status(404).json({ message: "Error: Meeting not found" });
        }
        try {
            proyecto.reuniones.splice(reunion, 1);
            await ReunionModel.findByIdAndDelete(idReunion);
            await proyecto.save();
            return res.status(200).json({ message: "The meeting has been deleted successfully" });
        } catch (error) {
            return res.status(200).json({ message: `Error: Could not delete meeting: ${error}` })
        }
    }
}

export const addColab: RequestHandler = async (req: Request, res: Response) => {
    const nombre = req.params.nombre;
    const { correoColab, temaReunion, fecha } = req.body;

    const proyecto = await ProyectoModel.findOne({ nombre: nombre });

    if (!proyecto) { return res.status(404).json({ message: "Error: Project not found" })}

    const colab = await ColaboradorModel.findOne({ correo: correoColab });

    if (!colab) { return res.status(404).json({ message: "Error: Collaborator not found" })}

    const reunion = await ReunionModel.findOne({ fecha: fecha, temaReunion: temaReunion });

    if (!reunion) { return res.status(404).json({ message: "Error: Meeting not found" })}

    try {
        reunion.colaboradores.push(colab.id);
        await reunion.save();
        return res.status(200).json({ message: `The collaborator ${colab.nombre} was added to the meeting` });
    } catch (error) {
        return res.status(400).json({ message: `Error: Couldn't add the collaborator to the meeting: ${error}` });
    }
}