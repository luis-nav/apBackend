import { ObjectId } from "mongoose";

export interface Tarea {
    nombre: string,
    descripcion: string,
    storyPoints: number,
    responsable: any,
    estado: string,
    fechaInicio: Date,
    fechaFinal: Date,
}