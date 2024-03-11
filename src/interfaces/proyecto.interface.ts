import { Date, ObjectId } from "mongoose";
import { Tarea } from "./tarea.interface";
import { Cambio } from "./cambio.interface";
import { Recurso } from "./recurso.interface";
import { Foro } from "./foro.interface";
import { Reunion } from "./reunion.interface";

export interface Proyecto {
    nombre: string,
    presupuesto: number,
    estado: string,
    descripcion: string,
    fechaInicio: Date,
    responsable: ObjectId,
    tareas: Tarea[],
    cambios: Cambio[],
    recursos: Recurso[],
    foro: Foro,
    reuniones: Reunion[]
}