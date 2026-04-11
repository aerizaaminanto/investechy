import transporter from "./mailer.js";

/** x
 * UNIVERSAL EMAIL SENDER
 * Supports:
 * - Forgot Password
 * - Reset Password
 * - Google OAuth Welcome Email
 * - Notifications
 */
export const sendEmail = async ({ to, subject, html }) => {
    try {
        if (!to || !subject || !html) {
            throw new Error("Missing email parameters");
        }

        const mail = await transporter.sendMail({
            from: Auth System<${ process.env.EMAIL }>,
            to,
            subject,
            html,
    });

    console.log("📩 Email sent successfully:", mail.messageId);

    return mail;
} catch (error) {
    console.error("❌ Email sending failed:", error.message);
    throw error;
}
};