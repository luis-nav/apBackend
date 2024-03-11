import { ObjectId } from "mongoose";

export interface Tarea {
    nombre: string,
    storyPoint: number,
    responsable: ObjectId,
    estado: ObjectId
}