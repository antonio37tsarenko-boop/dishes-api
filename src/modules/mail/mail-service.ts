import { createTransport, type Transporter } from 'nodemailer';

export class MailService {
    transport: Transporter;
    constructor() {
        this.transport = createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });
    }
    async sendOTPMail(
        OTP: string,
        to: string,
        title: string,
        text: string = "This is your OTP, don't tell it to nobody. If you didn't request this password ignore this message. ??",
        html?: string,
    ) {
        await this.transport.sendMail({
            to,
            subject: title,
            text: text.replace('??', OTP),
            html,
        });
    }
}
