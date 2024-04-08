import { ObjectId } from "mongoose";

export interface Tarea {
    nombre: string,
    storyPoints: number,
    responsable: ObjectId,
    estado: string,
    fechaInicio: Date,
    fechaFinal: Date,
}