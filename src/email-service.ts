import nodemailer from 'nodemailer';

class EmailService {
    private static instance: EmailService;
    private transporter: nodemailer.Transporter;

    private constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PSW
            }
        });
    }

    public static getInstance(): EmailService {
        if (!EmailService.instance) { EmailService.instance = new EmailService() }
        return EmailService.instance;
    }

    public async sendEmail(mailOptions: nodemailer.SendMailOptions): Promise<void> {
        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('[Email Service]: Se ha enviado un correo: ', info.response);
        } catch (error) {
            console.error('[Email Service]: Hubo un error enviando un correo: ', error);
        }
    }
}

const emailService = EmailService.getInstance();

export default emailService;
