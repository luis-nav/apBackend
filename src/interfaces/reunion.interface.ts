import { Date, ObjectId } from "mongoose";

export interface Reunion {
    proyecto: ObjectId,
    fecha: Date,
    temaReunion: string,
    medioReunion: string,
    formatoInvitacion: string,
    colaboradores: ObjectId[],
}