import nodemailer from "nodemailer";
import * as dotenv from 'dotenv';
dotenv.config()

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.USER_EMAIL_LOGIN,
        pass: process.env.USER_EMAIL_PASSWORD
    }
});

export const mailer = {
    sendPasswordResetOtp: async (to: string, otp: string) => {
        await transporter.sendMail({
            from: `"ESGI FINAL PROJECT" <${process.env.USER_EMAIL_LOGIN}>`,
            to,
            subject: "Votre code de réinitialisation de mot de passe",
            text: `Votre code de réinitialisation de mot de passe est ${otp}. Il expire dans 5 minutes.`,
        });
        console.log(`Code sent: ${otp}`);
    },
};
