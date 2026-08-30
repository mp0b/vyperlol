import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Sign in" };

const OAUTH_ERRORS: Record<string, string> = {
  oauth_unavailable: "That sign-in method isn't available right now.",
  oauth_state: "Your sign-in session expired. Please try again.",
  oauth_failed: "We couldn't complete sign-in. Please try again.",
  oauth_no_email: "That account has no email we can use.",
  email_unverified: "Verify your email with that provider first, then try again.",
  account_unavailable: "This account is not available.",
  unknown_provider: "Unknown sign-in method.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  if (await getCurrentUser()) redirect("/dashboard");
  const sp = await searchParams;
  const error = sp.error ? OAUTH_ERRORS[sp.error] : null;

  return (
    <Card className="bg-black/40 backdrop-blur-xl border-white/10 shadow-2xl text-white rounded-3xl overflow-hidden relative">
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-orange-500 to-red-600" />
      <CardHeader className="text-center pb-8 pt-10">
        <CardTitle className="text-3xl font-bold tracking-tight">Welcome back</CardTitle>
        <CardDescription className="text-gray-400 mt-2">Sign in to your Vyper account</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
        )}
        <OAuthButtons next={sp.next} />
        <LoginForm />
        <p className="text-center text-sm text-gray-400 mt-4">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-white hover:text-orange-400 hover:underline transition-colors">
            Create one
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
