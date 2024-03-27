import { ObjectId } from "mongoose";

export interface Colaborador {
    cedula: string,
    nombre: string,
    correo: string,
    departamento: ObjectId,
    telefono: string,
    proyecto: ObjectId,
    contrasena: string,
    validarContrasena?: (contrasenaCandidata:Error, callback: (err:any, esValida:any) => any) => void
}