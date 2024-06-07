import { Date, ObjectId } from "mongoose";

export interface Reunion {
    _id: any;
    fecha: Date,
    temaReunion: string,
    medioReunion: string,
    descripcion: string,
    colaboradores: any[],
}