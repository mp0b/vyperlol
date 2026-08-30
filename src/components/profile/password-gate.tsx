"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { unlockProfileAction } from "@/server/actions/profile-access";

export function PasswordGate({ profileId, username }: { profileId: string; username: string }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await unlockProfileAction(profileId, password);
      if (res.ok) router.refresh();
      else setError(res.error);
    });
  };

  return (
    <div
      style={{
        minHeight: "100svh",
        display: "grid",
        placeItems: "center",
        background: "radial-gradient(120% 120% at 50% 0%, #14121f, #08080e)",
        color: "#fff",
        padding: 20,
      }}
    >
      <form
        onSubmit={submit}
        style={{
          width: 340,
          maxWidth: "100%",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 18,
          padding: 28,
          textAlign: "center",
          backdropFilter: "blur(12px)",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            display: "grid",
            placeItems: "center",
            margin: "0 auto 14px",
            background: "rgba(124,92,255,0.15)",
            color: "#a78bfa",
          }}
        >
          <Lock size={22} />
        </div>
        <h1 style={{ fontSize: "1.1rem", fontWeight: 700 }}>@{username} is protected</h1>
        <p style={{ fontSize: "0.85rem", opacity: 0.7, marginTop: 4 }}>
          Enter the password to view this profile.
        </p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          placeholder="Password"
          style={{
            width: "100%",
            marginTop: 16,
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(0,0,0,0.3)",
            color: "#fff",
            outline: "none",
          }}
        />
        {error ? <p style={{ color: "#fca5a5", fontSize: "0.8rem", marginTop: 8 }}>{error}</p> : null}
        <button
          type="submit"
          disabled={pending || !password}
          style={{
            width: "100%",
            marginTop: 14,
            padding: "10px 12px",
            borderRadius: 10,
            border: 0,
            background: "#7c5cff",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
            opacity: pending || !password ? 0.6 : 1,
          }}
        >
          {pending ? "Unlocking…" : "Unlock"}
        </button>
      </form>
    </div>
  );
}
