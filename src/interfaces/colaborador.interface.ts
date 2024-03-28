import { ObjectId } from "mongoose";

export interface Colaborador {
    cedula: string,
    nombre: string,
    correo: string,
    departamento: any,
    telefono: string,
    proyecto: any,
    contrasena: string,
    admin: boolean,
    validarContrasena?: (contrasenaCandidata:string, callback: (err:Error | null, esValida:boolean) => any) => void
}