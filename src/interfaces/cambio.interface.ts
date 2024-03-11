import { Date } from "mongoose";

export interface Cambio {
    descripcion: string,
    tiempo: Date
}