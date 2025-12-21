import { createTransport, type Transporter } from 'nodemailer';

export class MailService {
    transport: Transporter;
    constructor(user: string, password: string) {
        this.transport = createTransport({
            service: 'gmail',
            auth: {
                user: user,
                pass: password,
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
