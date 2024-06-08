import emailService from "../email-service";
import { Colaborador } from "../interfaces/colaborador.interface";
import { ColaboradorModel } from "../models/colaborador.model";
import { jsPDF } from 'jspdf';

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

export const enviarReporte = async (correo:any, nombreReporte:any, text:any, attachment:any) => {
    await emailService.sendEmail({
        from: process.env.EMAIL_USER,
        to: correo,
        subject: nombreReporte,
        text: text,
        attachments: attachment
    })
}

export const addAttachementsAndSend = async (req:any, res:any) => {
    const { correo, nombreReporte, text, data, format, title, language, freeColabs, mode, fileName } = req.body;
    let attachment;
    let filename;

    if (format === 'CSV') {
        attachment = Buffer.from(convertToCSV(data, mode));
        filename = `${fileName}.csv`;
    } else if (format === 'XML') {
        attachment = Buffer.from(convertToXML(data));
        filename = `${fileName}.xml`;
    } else if (format === 'PDF') {
        attachment = generatePDF(data, title, language, freeColabs, mode);
        filename = `${fileName}.pdf`;
    }

    try {
        enviarReporte(correo,nombreReporte,text,[{ filename: filename, content: attachment }]);
        res.status(200).send('Correo electrónico enviado correctamente.');
    } catch (error) {
        console.error('Error al enviar el correo electrónico:', error);
        res.status(500).send('Error al enviar el correo electrónico.');
    }
};

const generatePDF = (data:any, title:any, language:any, freeColabs:any, mode:any) => {
    const doc = new jsPDF();
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    const lineHeight = 10;

    const textWidth = doc.getTextWidth(title);
    const x = (pageWidth - textWidth) / 2;

    doc.setFontSize(20);
    doc.text(title, x, margin);
    doc.setFontSize(12);
    
    let y = margin + 20;
    let subtitle = '';
    let contador = 0;

    data.forEach((item:any) => {
        Object.keys(item).forEach((key) => {
            if (y + lineHeight > pageHeight - margin) {
                doc.addPage();
                y = margin;
            }
            if (mode == 'colabs' && contador === 2) {
                subtitle = language === 'Spanish' ? 'Colaboradores libres:' : 'Free collaborators:';
                doc.setFontSize(16);
                doc.text(subtitle, margin, y);
                doc.setFontSize(12);
                y += 10;
            }
            if (mode == 'colabs'&& contador === freeColabs * 7) {
                subtitle = language === 'Spanish' ? 'Colaboradores con proyecto:' : 'Collaborators with project:';
                doc.setFontSize(16);
                doc.text(subtitle, margin, y);
                doc.setFontSize(12);
                y += lineHeight;
            }
            doc.text(`${key}: ${item[key]}`, margin, y);
            contador++;
            y += lineHeight;
        });
        y += lineHeight;
    });

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    return pdfBuffer;
};

const convertToCSV = (objArray:any, mode:any) => {
    const array = objArray;
    let str = '';
    let posicion = 0;
    if (mode === 'colabs') {posicion = 1};

    const headers = Object.keys(array[posicion]).join(',') + '\r\n';
    str += headers;

    for (let i = posicion; i < array.length; i++) {
        let line = '';
        for (const index in array[i]) {
            if (line !== '') line += ',';

            // Detectar si el valor es un array y convertirlo a una cadena
            if (Array.isArray(array[i][index])) {
                line += `"${array[i][index].join(', ')}"`;
            } else {
                line += array[i][index];
            }
        }
        str += line + '\r\n';
    }

    if (mode === 'colabs') {
        let line = '';
        for (const index in array[0]) {
            if (line !== '') line += ',';

            // Detectar si el valor es un array y convertirlo a una cadena
            if (Array.isArray(array[0][index])) {
                line += `"${array[0][index].join(', ')}"`;
            } else {
                line += array[0][index];
            }
        }
        str += line + '\r\n';
    }

    return str;
};

const convertToXML = (objArray:any) => {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n';

    objArray.forEach((obj:any) => {
        xml += '  <item>\n';
        for (const [key, value] of Object.entries(obj)) {
            xml += `    <${convertSpacesToUnderscores(key)}>${value}</${convertSpacesToUnderscores(key)}>\n`;
        }
        xml += '  </item>\n';
    });

    xml += '</root>';

    return xml;
};

function convertSpacesToUnderscores(str:any) {
    return str.replace(/ /g, '_');
}