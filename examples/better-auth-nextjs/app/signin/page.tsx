"use client";

import { type FormEvent, useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function SigninPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const result = await authClient.signIn.email({ email, password, callbackURL: "/" });
    if (result.error) setError(result.error.message ?? "Sign-in failed");
  }

  return (
    <main>
      <h1>Sign in</h1>
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
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        <button type="submit">Sign in</button>
      </form>
      <p>{error}</p>
    </main>
  );
}
