import type { APIRoute } from "astro";
import nodemailer from 'nodemailer';


export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    const formData = await request.formData();

    // Bot check (honeypot)
    if (formData.get("website")) {
        return new Response("Bot erkannt", { status: 400 });
    }

    const name = formData.get("name")?.toString() || "";
    const email = formData.get("email")?.toString() || "";
    const message = formData.get("message")?.toString() || "";

    if (!name || !email || !message || !email.includes("@")) {
        return new Response("Ungültige Eingaben", { status: 400 });
    }

    const transporter = nodemailer.createTransport({
        host: import.meta.env.SMTP_HOST,
        port: Number(import.meta.env.SMTP_PORT),
        secure: false,
        auth: {
            user: import.meta.env.SMTP_USER,
            pass: import.meta.env.SMTP_PASS,
        },
    });

    try {
        await transporter.sendMail({
            from: `"Kontaktformular ${new URL(request.url).origin}" <mail@silas-webdesign.de>`,
            to: import.meta.env.RECEIVER_EMAIL,
            replyTo: email,
            subject: `Neue Nachricht auf ${new URL(request.url).origin}`,
            text: `
name: ${name}
email: ${email}
message:
${message}
  `.trim(),
        });


        return new Response("Erfolgreich gesendet", { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response("Fehler beim Senden", { status: 500 });
    }
};
