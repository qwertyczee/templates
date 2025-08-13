const { z } = require("zod");

const registerSchema = z.object({
  body: z.object({
    email: z.string().email("Valid email is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    name: z.string().optional()
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Valid email is required"),
    password: z.string().min(6, "Password must be at least 6 characters")
  })
});

const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().optional()
  }).optional()
});

const googleVerifySchema = z.object({
  body: z.object({
    idToken: z.string().min(10, "Invalid Google ID token")
  })
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshSchema,
  googleVerifySchema
};