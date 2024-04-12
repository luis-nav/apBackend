import { Date, ObjectId } from "mongoose";

export interface Reunion {
    fecha: Date,
    temaReunion: string,
    medioReunion: string,
    descripcion: string,
    colaboradores: any[],
}