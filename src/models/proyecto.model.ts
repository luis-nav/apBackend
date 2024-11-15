import mongoose from "mongoose";

import { Tarea } from "../interfaces/tarea.interface";
import { Cambio } from "../interfaces/cambio.interface";
import { Recurso } from "../interfaces/recurso.interface";
import { Proyecto } from "../interfaces/proyecto.interface";

const tareaSchema = new mongoose.Schema<Tarea>({
    nombre: {
        type: String,
        required: true,
    },
    descripcion: {
        type: String,
        required: true
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
        type: String,
        required: true
    },
    fechaInicio: {
        type: Date,
        required: true,
        default: Date.now
    },
    fechaFinal: {
        type: Date,
    },
});

const cambioSchema = new mongoose.Schema<Cambio>({
    titulo: {
        type: String,
        required: true,
    },
    descripcion: {
        type: String,
        required: true,
    },
    tiempo: {
        type: Date,
        required: true,
        default: Date.now
    },
    aprobadoPor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Colaborador",
    },
});

const recursoSchema = new mongoose.Schema<Recurso>({
    nombre: {
        type: String,
        required: true,
    },
    descripcion: {
        type: String,
        required: true,
    },
    tipo: {
        type: String,
        required: true
    }
});

const proyectSchema = new mongoose.Schema<Proyecto>({
    nombre: {
        type: String,
        required: true,
        unique: true
    },
    estado: {
        type: String,
        required: true,
    },
    presupuesto: {
        type: Number,
        required: true,
    },
    descripcion: {
        type: String,
        required: true,
    },
    fechaInicio: {
        type: Date,
        required: true,
    },
    fechaFinal: {
        type: Date,
        required: true,
    },
    responsable: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Colaborador",
        required: true,
    },
    tareas: {
        type: [tareaSchema],
    },
    cambios: {
        type: [cambioSchema],
    },
    recursos: {
        type: [recursoSchema],
    },
    foro: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Foro",
    },
    reuniones: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Reunion",
    }

});

export const ProyectoModel = mongoose.model("Proyecto", proyectSchema);