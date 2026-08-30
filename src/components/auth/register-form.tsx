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

      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-muted-foreground/20" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Ou continuer avec</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-2">
        <Button 
          type="button" 
          variant="outline" 
          className="w-full bg-white/5 hover:bg-white/10"
          onClick={() => toast.info("Coming soon", { icon: "⏳" })}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Google
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          className="w-full bg-[#5865F2]/10 text-[#5865F2] hover:bg-[#5865F2]/20 border-[#5865F2]/30 hover:border-[#5865F2]/50"
          onClick={() => toast.info("Coming soon", { icon: "⏳" })}
        >
          <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
          </svg>
          Discord
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-2">
        By creating an account you agree to our{" "}
        <a href="/terms" className="underline hover:text-foreground">Terms</a> and{" "}
        <a href="/privacy" className="underline hover:text-foreground">Privacy Policy</a>.
      </p>
    </form>
  );
}
