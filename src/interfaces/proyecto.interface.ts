import { Date, ObjectId } from "mongoose";
import { Tarea } from "./tarea.interface";
import { Cambio } from "./cambio.interface";
import { Recurso } from "./recurso.interface";
import { Foro } from "./foro.interface";
import { Reunion } from "./reunion.interface";

export interface Proyecto {
    nombre: string,
    presupuesto: number,
    estado: any,
    descripcion: string,
    fechaInicio: Date,
    fechaFinal: Date,
    responsable: any,
    tareas: Tarea[],
    cambios: Cambio[],
    recursos: Reunion[],
    foro: any,
    reuniones: ObjectId[],
    colaboradores?: any
}