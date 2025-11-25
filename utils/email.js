const { Resend } = require('resend');
const { env } = require("../config/env")

/**
 * Basic email sending utility using Resend
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text version of the email
 * @param {string} options.html - HTML version of the email
 * @returns {Promise} - Resolves when email is sent
 */
const sendEmail = async (options) => {
    try {
        // Initialize Resend with API key
        const resend = new Resend(env.resendApiKey);
        
        if (!env.resendApiKey) {
            console.error('RESEND_API_KEY environment variable is not set');
            return null;
        }
        
        // Send the email
        const { data, error } = await resend.emails.send({
            from: `${env.emailFromName} <${env.emailFromAddress}>`,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
            replyTo: env.supportEmail,
        });
        
        if (error) {
            console.error('Error sending email with Resend:', error);
            return null;
        }
        return data;
    } catch (error) {
        console.error('Error sending email:', {
            to: options.to,
            subject: options.subject,
            error: error.message
        });
        return null;
    }
};

module.exports = {
    sendEmail
};