const { Resend } = require('resend');
const { env } = require("../config/env");
const { logger } = require('./logger');

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
    if (!env.resendApiKey) {
        throw new Error('Email service not configured');
    }
    
    const resend = new Resend(env.resendApiKey);
    
    const { data, error } = await resend.emails.send({
        from: `${env.emailFromName} <${env.emailFromAddress}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        replyTo: env.supportEmail,
    });
    
    if (error) {
        logger.error('Error sending email with Resend:', { error: error.message, stack: error.stack });
        throw new Error('Failed to send email');
    }
    
    return data;
};

module.exports = {
    sendEmail
};