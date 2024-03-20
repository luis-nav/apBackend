import { Request, Response, RequestHandler } from "express";

import { ReunionModel } from "../models/reunion.model";
import { ColaboradorModel } from "../models/colaborador.model";
import { ProyectoModel } from "../models/proyecto.model";
import { arrayBuffer } from "stream/consumers";

export const getReuniones: RequestHandler = async (req: Request, res: Response) => {
    const nombreProyecto  = req.params.nombreProyecto;
    const reuniones = await ProyectoModel.find({ nombreProyecto })
        .populate({ path: "reuniones"})
        .lean().exec();
    return res.status(200).json(reuniones);
}

export const crearReunion: RequestHandler = async (req: Request, res: Response) => {
    const nombreProyecto  = req.params.nombreProyecto;
    const { fecha, temaReunion, medioReunion, formatoInvitacion, colaboradores } = req.body;
    const proyecto = await ProyectoModel.findOne({ nombreProyecto });
    let empleados: any[] = []

    colaboradores.array.forEach((nombre: string) => {
        const colab = ColaboradorModel.findOne({ nombre: nombre });
        if (colab === null) {
            return res.status(404).json({ message: `Error: ${nombre} no es un colaborador registrado`})
        };
        empleados.push(colab)
    });
    try {
        const reunion = new ReunionModel({
            fecha, 
            temaReunion, 
            medioReunion, 
            formatoInvitacion, 
            empleados
        });
        await reunion.save();
        proyecto?.reuniones.push(reunion.id);
        await proyecto?.save();
        return res.status(201).json({ message: "Reunión creada!"});  
    } catch (error) {
        return res.status(400).json({ message: `Error: No se ha podido crear la reunión: ${error}` });;
    }
}