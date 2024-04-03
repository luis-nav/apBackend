import { ObjectId } from "mongoose";

export interface Tarea {
    nombre: string,
    storyPoints: number,
    responsable: ObjectId,
    estado: ObjectId,
    fechaInicio: Date,
    fechaFinal: Date,
}