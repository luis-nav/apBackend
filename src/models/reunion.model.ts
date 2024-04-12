import mongoose, { Schema } from "mongoose";

import { Reunion } from "../interfaces/reunion.interface";

const reunionSchema = new Schema<Reunion>({
    fecha: {
        type: Date,
        required: true,
    },
    temaReunion: {
        type: String,
        required: true,
    },
    medioReunion: {
        type: String,
        required: true,
    },
    descripcion: {
        type: String,
        required: true,
    },
    colaboradores: {
        type: [Schema.Types.ObjectId],
        ref: "Colaborador",
    }
});

export const ReunionModel = mongoose.model<Reunion>("Reunion", reunionSchema);