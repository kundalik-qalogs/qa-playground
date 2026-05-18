import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

const appUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";
const trustedOrigins = Array.from(
  new Set(
    [
      appUrl,
      process.env.NEXT_PUBLIC_APP_URL,
      "https://qaplayground.com",
      "https://www.qaplayground.com",
      "http://localhost:3000",
    ].filter(Boolean),
  ),
);

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,

    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your QA Playground password",
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff;border-radius:8px">
            <h2 style="color:#1e1b4b;margin-bottom:8px">Reset your password</h2>
            <p style="color:#475569;margin-bottom:24px">
              Hi ${user.name || user.email},<br/>
              We received a request to reset your QA Playground password. Click the button below to choose a new one.
            </p>
            <a href="${url}" style="display:inline-block;padding:12px 24px;background:linear-gradient(to right,#2563eb,#7c3aed);color:#fff;text-decoration:none;border-radius:6px;font-weight:600">
              Reset password
            </a>
            <p style="color:#94a3b8;font-size:12px;margin-top:24px">
              If you didn't request a password reset, you can safely ignore this email.<br/>
              This link expires in 1 hour.
            </p>
          </div>
        `,
      });
    },
  },

  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your QA Playground email",
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff;border-radius:8px">
            <h2 style="color:#1e1b4b;margin-bottom:8px">Verify your email</h2>
            <p style="color:#475569;margin-bottom:24px">
              Hi ${user.name || user.email},<br/>
              Click the button below to verify your QA Playground account.
            </p>
            <a href="${url}" style="display:inline-block;padding:12px 24px;background:linear-gradient(to right,#2563eb,#7c3aed);color:#fff;text-decoration:none;border-radius:6px;font-weight:600">
              Verify email
            </a>
            <p style="color:#94a3b8;font-size:12px;margin-top:24px">
              If you didn't create an account, you can safely ignore this email.<br/>
              This link expires in 24 hours.
            </p>
          </div>
        `,
      });
    },
  },

  // Expose the role field on the session user object
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "USER",
        // Prevent clients from overriding role during sign-up
        input: false,
      },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Refresh session cookie daily
  },

  trustedOrigins,
});
