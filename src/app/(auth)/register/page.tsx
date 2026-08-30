import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Create your account" };

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/dashboard");

  return (
    <Card className="bg-black/40 backdrop-blur-xl border-white/10 shadow-2xl text-white rounded-3xl overflow-hidden relative">
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-orange-500 to-red-600" />
      <CardHeader className="text-center pb-8 pt-10">
        <CardTitle className="text-3xl font-bold tracking-tight">Claim your link</CardTitle>
        <CardDescription className="text-gray-400 mt-2">Create your Vyper — it&apos;s free, forever</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <OAuthButtons />
        <RegisterForm />
        <p className="text-center text-sm text-gray-400 mt-4">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-white hover:text-orange-400 hover:underline transition-colors">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
