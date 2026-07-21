import { betterAuth } from "better-auth";
import { emailOTP, magicLink } from "better-auth/plugins";
import Database from "better-sqlite3";
import { sendMail } from "./mailer";

export const auth = betterAuth({
  database: new Database("./auth.db"),
  secret: process.env.BETTER_AUTH_SECRET ?? "inboxtap-example-dev-secret-not-for-production-use",
  baseURL: "http://localhost:3000",
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendMail({
        to: user.email,
        subject: "Verify your email",
        text: `Confirm your account by opening this link: ${url}`,
      });
    },
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await sendMail({
          to: email,
          subject: "Your sign-in link",
          text: `Open this link to sign in: ${url}`,
        });
      },
    }),
    emailOTP({
      sendVerificationOTP: async ({ email, otp }) => {
        await sendMail({
          to: email,
          subject: "Your sign-in code",
          text: `Your code is ${otp}`,
        });
      },
    }),
  ],
});
