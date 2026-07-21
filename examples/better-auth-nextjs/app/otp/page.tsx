"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function OtpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [status, setStatus] = useState("");

  async function requestCode(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const { error } = await authClient.emailOtp.sendVerificationOtp({ email, type: "sign-in" });
    if (error) {
      setStatus(error.message ?? "Could not send the code");
      return;
    }
    setCodeSent(true);
    setStatus("Check your email for a sign-in code");
  }

  async function submitCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { error } = await authClient.signIn.emailOtp({ email, otp });
    if (error) {
      setStatus(error.message ?? "Sign-in failed");
      return;
    }
    router.push("/");
  }

  return (
    <main>
      <h1>Email OTP</h1>
      {codeSent ? (
        <form onSubmit={submitCode}>
          <label>
            Code
            <input value={otp} onChange={(event) => setOtp(event.target.value)} required />
          </label>
          <button type="submit">Sign in</button>
          <button type="button" onClick={() => requestCode()}>
            Send a new code
          </button>
        </form>
      ) : (
        <form onSubmit={requestCode}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <button type="submit">Email me a code</button>
        </form>
      )}
      <p>{status}</p>
    </main>
  );
}
