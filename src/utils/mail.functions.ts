import emailService from "../email-service";
import { Colaborador } from "../interfaces/colaborador.interface";
import { ColaboradorModel } from "../models/colaborador.model";

export const enviarCambiosColaboradores = async (cambioStr: string, proyecto: any) => {
    const colaboradores = await ColaboradorModel.find({ proyecto });
    colaboradores.forEach(async (colab) => await emailService.sendEmail({
        from: process.env.EMAIL_USER,
        to: colab.correo,
        subject: `Cambio en proyecto ${proyecto.nombre}`,
        text: `Hey ${colab.nombre}!\n\n 
        Some details about your project have changed. ${cambioStr}.\n
        You might want to check it out.`
    }))
}

export const enviarAvisoTarea = async (colaborador: Colaborador, proyecto: any) => {
     await emailService.sendEmail({
        from: process.env.EMAIL_USER,
        to: colaborador.correo,
        subject: `New task assigned on project ${proyecto.nombre}`,
        text: `Hey ${colaborador.nombre}!\n\n 
        A new task has been assigned to you.\n
        Check the app to see more details.`
    })
}

export const enviarAvisoReunion = async (temaReunion: string, fecha: any, proyecto: any) => {
    const colaboradores = await ColaboradorModel.find({ proyecto });
    colaboradores.forEach(async (colaborador) => await emailService.sendEmail({
        from: process.env.EMAIL_USER,
        to: colaborador.correo,
        subject: `You've been added to a meeting about ${temaReunion}`,
        text: `Hey ${colaborador.nombre}!\n\n
        You have a new meeting on ${fecha} about ${temaReunion}.\n\n
        You better attend to the meting!
        `,
    }));
}

export const enviarAsignacionProyecto = async (colaborador: Colaborador, proyecto:any) => {
    await emailService.sendEmail({
        from: process.env.EMAIL_USER,
        to: colaborador.correo,
        subject: `New project assigned : ${proyecto.nombre}`,
        text: `Hey ${colaborador.nombre}!\n\n 
        A new project has been assigned to you.\n
        Check the app to see more details.`
    })
}