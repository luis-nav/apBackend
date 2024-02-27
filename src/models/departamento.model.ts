import mongoose from "mongoose";

import { Departamento } from "../interfaces/departamento.interface";

const departamentoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        unique: true,
        required: true,
    }
});

export const DepartamentoModel = mongoose.model<Departamento>("Departamento", departamentoSchema);