import { Request, Response, RequestHandler } from "express";

import { ReunionModel } from "../models/reunion.model";
import { ColaboradorModel } from "../models/colaborador.model";
import { ProyectoModel } from "../models/proyecto.model";

export const getReuniones: RequestHandler = async (req: Request, res: Response) => {
    const nombreProyecto  = req.params.nombreProyecto;
    const proyecto = await ProyectoModel.findOne({ nombreProyecto })
    if (proyecto === null) {
        return res.status(404).json({ message: "Error: Project not found" });
    }
    else {
        const reuniones = await ProyectoModel.find({ nombreProyecto })
        .populate({ path: "reuniones"})
        .lean().exec();
        return res.status(200).json(reuniones);
    }
}

export const crearReunion: RequestHandler = async (req: Request, res: Response) => {
    const nombreProyecto  = req.params.nombreProyecto;
    const { fecha, temaReunion, medioReunion, formatoInvitacion, colaboradores } = req.body;
    const proyecto = await ProyectoModel.findOne({ nombreProyecto });
    if (proyecto === null) {
        return res.status(404).json({ message: "Error: Project not found" });
    }
    else {
        let empleados: any[] = []

        colaboradores.array.forEach((nombre: string) => {
            const colab = ColaboradorModel.findOne({ nombre: nombre });
            if (colab === null) {
                return res.status(404).json({ message: `Error: ${nombre} is not a registered collaborator`})
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
            return res.status(201).json({ message: "Meeting created!"});  
        } catch (error) {
            return res.status(400).json({ message: `Error: Could not create meeting: ${error}` });;
        }
    }
}

export const eliminarReunion: RequestHandler = async (req:Request, res:Response) => {
    const nombre  = req.params.nombre;
    const { fecha, temaReunion } = req.body;
    const proyecto = await ProyectoModel.findOne({ nombre });
    if (proyecto === null) {
        return res.status(404).json({ message: "Error: Project not found" });
    }
    else {
        const reunion = proyecto.reuniones.findIndex((fecha, temaReunion) => (fecha === fecha && temaReunion === temaReunion));
        try {
            proyecto.reuniones.splice(reunion, 1);
            await ReunionModel.findOneAndDelete({ reunion });
            await proyecto.save();
            return res.status(200).json({ message: "The meeting has been deleted successfully" });
        } catch (error) {
            return res.status(200).json({ message: `Error: Could not delete meeting: ${error}` })
        }
    }
}