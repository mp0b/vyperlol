"use client";

import { useState, useTransition } from "react";
import { MailWarning } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { resendVerificationAction } from "@/server/actions/auth";

export function VerifyEmailBanner() {
  const [pending, start] = useTransition();
  const [sent, setSent] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-[var(--warning)]/30 bg-[var(--warning)]/10 px-4 py-2.5 text-sm">
      <MailWarning className="size-4 text-[var(--warning)]" />
      <span className="text-foreground">
        Verify your email to publish your profile and secure your account.
      </span>
      <Button
        size="sm"
        variant="outline"
        className="ml-auto"
        disabled={pending || sent}
        onClick={() =>
          start(async () => {
            const res = await resendVerificationAction();
            if (res.ok) {
              setSent(true);
              toast.success("Verification email sent (check the dev console in development).");
            } else {
              toast.error(res.error);
            }
          })
        }
      >
        {sent ? "Sent" : pending ? "Sending…" : "Resend email"}
      </Button>
    </div>
  );
}
