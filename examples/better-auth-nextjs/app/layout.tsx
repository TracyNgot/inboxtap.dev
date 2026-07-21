import Link from "next/link";
import type { ReactNode } from "react";

export const metadata = {
  title: "InboxTap Better Auth example",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav>
          <Link href="/">Home</Link> <Link href="/signup">Sign up</Link>{" "}
          <Link href="/signin">Sign in</Link> <Link href="/magic-link">Magic link</Link>{" "}
          <Link href="/otp">Email OTP</Link>
        </nav>
        <hr />
        {children}
      </body>
    </html>
  );
}
