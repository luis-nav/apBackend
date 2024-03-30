import emailService from "../email-service";
import { ColaboradorModel } from "../models/colaborador.model";

export const enviarCambiosColaboradores = async (cambioStr: string, proyecto: any) => {
    const colaboradores = await ColaboradorModel.find({ proyecto });
    colaboradores.forEach(async (colab) => await emailService.sendEmail({
        from: process.env.EMAIL_USER,
        to: colab.correo,
        subject: `Cambio en proyecto ${proyecto.nombre}`,
        text: `¡Hola ${colab.nombre}!\n\n 
        Se han cambiado detalles del proyecto. ${cambioStr}.\n
        Revise la plataforma para mas detalles.\n\nSaludos Cordiales`
    }))
}

export const enviarAvisoTarea = async (cambioStr: string, proyecto: any) => {
    const colaboradores = await ColaboradorModel.find({ proyecto });
    colaboradores.forEach(async (colab) => await emailService.sendEmail({
        from: process.env.EMAIL_USER,
        to: colab.correo,
        subject: `Cambio en proyecto ${proyecto.nombre}`,
        text: `¡Hola ${colab.nombre}!\n\n 
        Se han cambiado detalles del proyecto. ${cambioStr}.\n
        Revise la plataforma para mas detalles.\n\nSaludos Cordiales`
    }))
}