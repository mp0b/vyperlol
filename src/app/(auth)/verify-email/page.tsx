import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { verifyEmailToken } from "@/server/actions/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Verify your email" };

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = token ? await verifyEmailToken(token) : { ok: false, reason: "Missing token." };

  return (
    <Card>
      <CardHeader className="items-center text-center">
        <div
          className={`flex size-12 items-center justify-center rounded-full ${
            result.ok ? "bg-[var(--success)]/15 text-[var(--success)]" : "bg-destructive/15 text-destructive"
          }`}
        >
          {result.ok ? <CheckCircle2 className="size-6" /> : <XCircle className="size-6" />}
        </div>
        <CardTitle className="mt-2 text-xl">
          {result.ok ? "Email verified" : "Verification failed"}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 text-center">
        <p className="text-sm text-muted-foreground">
          {result.ok
            ? "Your email is confirmed. You're all set to publish your profile."
            : result.reason}
        </p>
        <Button asChild>
          <Link href="/dashboard">Go to dashboard</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
