import mongoose from "mongoose";
import { EstadoTarea } from "../interfaces/estadoTarea.interface";

const estadoTareaSchema = new mongoose.Schema({
    nombre: {
        type: String,
        unique: true,
        required: true,
    }
});

export const DepartamentoModel = mongoose.model<EstadoTarea>("EstadoTarea", estadoTareaSchema);