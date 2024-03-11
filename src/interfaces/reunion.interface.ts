import { Date, ObjectId } from "mongoose";

export interface Reunion {
    fecha: Date,
    temaReunion: string,
    medioReunion: string,
    formatoInvitacion: string,
    colaboradores: ObjectId[],
}