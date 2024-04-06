import { Date } from "mongoose";
import { Colaborador } from "./colaborador.interface";

export interface Cambio {
    titulo: string,
    descripcion: string,
    tiempo: Date,
    aprobadoPor: any, 
}