"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { registerSchema, type RegisterInput } from "@/lib/validation/auth";
import { registerAction } from "@/server/actions/auth";
import { validateUsernameFormat } from "@/lib/username";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type AvailState = "idle" | "checking" | "available" | "taken" | "invalid";

export function RegisterForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [avail, setAvail] = useState<AvailState>("idle");
  const [availReason, setAvailReason] = useState<string | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const username = watch("username");

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    if (!username) return setAvail("idle");
    const fmt = validateUsernameFormat(username);
    if (!fmt.ok) {
      setAvail("invalid");
      setAvailReason(fmt.reason);
      return;
    }
    setAvail("checking");
    debounce.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/username/check?u=${encodeURIComponent(username)}`);
        const data = (await res.json()) as { available: boolean; reason: string | null };
        setAvail(data.available ? "available" : "taken");
        setAvailReason(data.reason);
      } catch {
        setAvail("idle");
      }
    }, 400);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [username]);

  const onSubmit = (values: RegisterInput) => {
    setFormError(null);
    if (avail === "taken") {
      setError("username", { message: "That username is taken." });
      return;
    }
    start(async () => {
      const res = await registerAction(values);
      if (res.ok) {
        toast.success("Account created — welcome to Vyper!");
        router.push("/dashboard");
        router.refresh();
      } else {
        setFormError(res.error);
        if (res.fieldErrors) {
          for (const [k, v] of Object.entries(res.fieldErrors)) {
            setError(k as keyof RegisterInput, { message: v });
          }
        }
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="username">Username</Label>
        <div className="flex items-center rounded-md border border-input focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/40">
          <span className="pl-3 text-sm text-muted-foreground">vyper.lol/</span>
          <input
            id="username"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="yourname"
            className="h-9 flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground"
            {...register("username")}
          />
          <span className="pr-3">
            {avail === "checking" && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
            {avail === "available" && <Check className="size-4 text-[var(--success)]" />}
            {(avail === "taken" || avail === "invalid") && <X className="size-4 text-destructive" />}
          </span>
        </div>
        {(avail === "taken" || avail === "invalid") && availReason && (
          <p className="text-xs text-destructive">{availReason}</p>
        )}
        {avail === "available" && <p className="text-xs text-[var(--success)]">Available!</p>}
        {errors.username && avail !== "invalid" && (
          <p className="text-xs text-destructive">{errors.username.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} aria-invalid={!!errors.email} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" autoComplete="new-password" placeholder="At least 8 characters" {...register("password")} aria-invalid={!!errors.password} />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>

      {formError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{formError}</p>
      )}

      <Button type="submit" disabled={pending || avail === "checking"} className={cn("w-full")}>
        {pending && <Loader2 className="size-4 animate-spin" />}
        Create account
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        By creating an account you agree to our{" "}
        <a href="/terms" className="underline hover:text-foreground">Terms</a> and{" "}
        <a href="/privacy" className="underline hover:text-foreground">Privacy Policy</a>.
      </p>
    </form>
  );
}
