const { z } = require("zod");

const sendMagicLinkSchema = z.object({
  body: z.object({
    email: z.string().email("Valid email is required"),
  })
});

const verifyMagicLinkSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Token is required"),
  })
});

const refreshSchema = z.object({
  body: z.object({}).optional()
});

module.exports = {
  sendMagicLinkSchema,
  verifyMagicLinkSchema,
  refreshSchema,
};