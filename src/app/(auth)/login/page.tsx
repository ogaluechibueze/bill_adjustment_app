"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation"; // ✅ import router
import * as z from "zod";
import { Mail, Lock, Loader2, Eye, EyeOff, LogInIcon } from "lucide-react";
import Image from "next/image";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "ccro@example.com",
      password: "Passw0rd!",
    },
  });

  async function onSubmit(values: LoginForm) {
    setLoading(true);

    const res = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false, // ✅ prevent auto redirect
    });

    if (res?.error) {
      alert("Invalid credentials");
      setLoading(false);
      return;
    }

    // ✅ Fetch session after login
    const sessionRes = await fetch("/api/auth/session");
    const session = await sessionRes.json();
    const role = session?.user?.role;

    switch (role) {
      case "CCRO":
        router.push("/dashboard/ccro");
        break;
      case "HCC":
        router.push("/dashboard/hcc");
        break;
      case "BM":
        router.push("/dashboard/bm");
        break;
      case "RH":
        router.push("/dashboard/rh");
        break;
      case "RA":
        router.push("/dashboard/ra");
        break;
      case "IA":
        router.push("/dashboard/ia");
        break;
      case "CIA":
        router.push("/dashboard/cia");
        break;
      case "MD":
        router.push("/dashboard/md");
        break;
      case "ADMIN":
        router.push("/dashboard/admin");
        break;
      default:
        router.push("/");
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-6">
      <Card className="w-full max-w-md shadow-xl border border-slate-200">
  <CardHeader className="flex flex-col items-center space-y-3">
    {/* 🔹 Logo */}
    <Image
      src="/logo2.png" 
      alt="App Logo"
      width={150}
      height={150}
      className="rounded-md"
    />

    <CardTitle className="text-2xl font-bold text-center">
      Welcome Back
    </CardTitle>
    <CardDescription className="text-center">
      Sign in with your credentials to access the dashboard
    </CardDescription>
  </CardHeader>

  <form onSubmit={form.handleSubmit(onSubmit)}>
    <CardContent className="space-y-4">
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            className="pl-10"
            {...form.register("email")}
          />
        </div>
        {form.formState.errors.email && (
          <p className="text-sm text-red-500">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="********"
            className="pl-10 pr-10"
            {...form.register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-700"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {form.formState.errors.password && (
          <p className="text-sm text-red-500">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>
    </CardContent>

    <CardFooter className="flex flex-col gap-2 py-3">
      <Button type="submit" className="w-full" disabled={loading}>
        <LogInIcon/>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? "Signing in..." : "Sign In"}
      </Button>
      <Link href="/">
      <Button className="bg-green-400">
       {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? "Returning Home..." : "Return Home"}
      </Button>
      </Link>
    </CardFooter>
  </form>
</Card>

    </main>
  );
}
