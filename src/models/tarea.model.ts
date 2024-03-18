import mongoose from "mongoose";

import { Tarea } from "../interfaces/tarea.interface";

const tareaSchema = new mongoose.Schema<Tarea>({
    nombre: {
        type: String,
        required: true,
    },
    storyPoints: {
        type: Number,
        required: true,
    },
    responsable: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Colaborador",
        required: true,
    },
    estado: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EstadoTarea",
        required: true
    }
});

export const TareaModel = mongoose.model("Tarea", tareaSchema);