"use client";

import { authClient } from "@/lib/auth-client";

export default function HomePage() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) return <p>Loading session…</p>;
  if (!session) return <p>Signed out</p>;

  return (
    <main>
      <p>
        Signed in as {session.user.email} (verified: {String(session.user.emailVerified)})
      </p>
      <button type="button" onClick={() => authClient.signOut()}>
        Sign out
      </button>
    </main>
  );
}
