import { Date, ObjectId } from "mongoose";

export interface Mensaje {
    mensaje: string,
    tiempo: Date,
    colaborador: ObjectId,
}