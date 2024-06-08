import nodemailer from 'nodemailer';

class EmailService {
    private static instance: EmailService;
    private transporter: nodemailer.Transporter;

    private constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'Outlook',
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
            console.log('[Email Service]: An email has been sent: ', info.response);
        } catch (error) {
            console.error('[Email Service]: There was an error sending an email: ', error);
        }
    }
}

const emailService = EmailService.getInstance();

export default emailService;
