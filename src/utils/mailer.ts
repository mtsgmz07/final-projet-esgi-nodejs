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

    sendNewLogin: async (to: string) => {
        await transporter.sendMail({
            from: `"ESGI FINAL PROJECT" <${process.env.USER_EMAIL_LOGIN}>`,
            to,
            subject: "Nouvelle connexion détectée",
            text: `Une nouvelle connexion a été détectée sur votre compte. Si vous n'êtes pas à l'origine de cette connexion, veuillez réinitialiser votre mot de passe immédiatement.`,
        });
        console.log(`New login notification sent to: ${to}`);
    },

    sendRegister: async (to: string) => {
        await transporter.sendMail({
            from: `"ESGI FINAL PROJECT" <${process.env.USER_EMAIL_LOGIN}>`,
            to,
            subject: "Bienvenue sur notre application",
            text: `Merci de vous être inscrit sur notre application. Nous sommes ravis de vous accueillir !`,
        });
        console.log(`Registration confirmation sent to: ${to}`);
    },
};
