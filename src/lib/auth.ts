import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAILER_EMAIL,
    pass: process.env.MAILER_PASS,
  },
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: [process.env.APP_ORIGIN_URL!],
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "USER",
        required: false,
      },
      phone: {
        type: "string",
        required: false,
      },
      status: {
        type: "string",
        defaultValue: "ACTIVE",
        required: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
  },
  socialProviders: {
    google: {
      prompt: "select_account consent",
      accessType: "offline",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      try {
        const verificationUrl = `${process.env.APP_ORIGIN_URL}/verify-email/token=${token}`;
        const info = await transporter.sendMail({
          from: '"Blog Application" <no-reply@blogapp.com>',
          to: user.email,
          subject: "Verify your email",
          html: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Verify your email</title>
  </head>
  <body
    style="
      margin: 0;
      padding: 0;
      background-color: #f4f4f5;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
        Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
    "
  >
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 40px 16px">
          <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            style="
              max-width: 420px;
              background: #ffffff;
              border-radius: 12px;
              box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
              padding: 32px;
            "
          >
            <!-- Header -->
            <tr>
              <td style="text-align: center">
                <h1
                  style="
                    margin: 0;
                    font-size: 22px;
                    font-weight: 600;
                    color: #111827;
                  "
                >
                  Verify your email
                </h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding-top: 16px">
                <p
                  style="
                    margin: 0;
                    font-size: 15px;
                    line-height: 1.6;
                    color: #4b5563;
                  "
                >
                  Hi ${user.name.toUpperCase()},
                </p>

                <p
                  style="
                    margin: 16px 0;
                    font-size: 15px;
                    line-height: 1.6;
                    color: #4b5563;
                  "
                >
                  Thanks for signing up for <strong>Blog Application</strong>.
                  Please confirm your email address by clicking the button below.
                </p>
              </td>
            </tr>

            <!-- Button -->
            <tr>
              <td align="center" style="padding: 24px 0">
                <a
                  href="${verificationUrl}"
                  style="
                    display: inline-block;
                    padding: 12px 24px;
                    background-color: #111827;
                    color: #ffffff;
                    text-decoration: none;
                    font-size: 14px;
                    font-weight: 500;
                    border-radius: 8px;
                  "
                >
                  Verify Email
                </a>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td>
                <p
                  style="
                    margin: 0;
                    font-size: 13px;
                    line-height: 1.6;
                    color: #6b7280;
                    text-align: center;
                  "
                >
                  If you didn’t create an account, you can safely ignore this
                  email.
                </p>

                <p
                  style="
                    margin-top: 24px;
                    font-size: 12px;
                    color: #9ca3af;
                    text-align: center;
                  "
                >
                  © 2025 Blog Application
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`,
        });

        console.log("Message sent:", info.messageId);
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  },
});
