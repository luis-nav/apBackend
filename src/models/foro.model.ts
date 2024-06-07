import mongoose, { Schema } from "mongoose";

import { Mensaje } from '../interfaces/mensaje.interface';
import { Foro } from "../interfaces/foro.interface";

const mensajeSchema = new mongoose.Schema<Mensaje>({
    mensaje: {
        type: String,
        required: true,
    },
    tiempo: {
        type: Date,
        default: Date.now
    },
    colaborador: {
        type: Schema.Types.ObjectId,
    },
    respuestas: [{
        mensaje: {
            type: String,
            required: true,
        },
        tiempo: {
            type: Date,
            default: Date.now
        },
        colaborador: {
            type: Schema.Types.ObjectId,
        },
    }]
});

// Indice Ascendiente
mensajeSchema.index({ tiempo: 1 });

const foroSchema = new mongoose.Schema({
    esDeProyecto: {
        type: Boolean,
        default: true,
    },
    mensajes: {
        type: [mensajeSchema],
    }
});

export const ForoModel = mongoose.model<Foro>("Foro", foroSchema);