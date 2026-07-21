"use client";

import { type FormEvent, useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function MagicLinkPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { error } = await authClient.signIn.magicLink({ email, callbackURL: "/" });
    setStatus(
      error ? (error.message ?? "Could not send the link") : "Check your email for a sign-in link",
    );
  }

  return (
    <main>
      <h1>Magic link</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <button type="submit">Email me a sign-in link</button>
      </form>
      <p>{status}</p>
    </main>
  );
}
