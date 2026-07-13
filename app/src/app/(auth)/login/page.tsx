"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Activity, Shield, Users, Stethoscope } from "lucide-react";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { login } from "./actions";
import { loginSchema, type LoginInput } from "@/lib/validators/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginInput) {
    setError(null);
    setIsLoading(true);

    try {
      const result = await login(values);
      if (result?.error) {
        setError(result.error);
      }
    } catch (err) {
      if (isRedirectError(err)) {
        throw err;
      }
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
              {/* <Activity className="h-6 w-6 text-white" /> */}
              <Stethoscope className="w-5 h-5 text-primary-foreground" />
            </div>

            <span className="text-2xl font-bold text-white">Dr.Note</span>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Clinical notes,
            <br />
            simplified.
          </h1>
          <p className="text-lg text-white/80 max-w-md">
            Streamline patient visits, prescriptions, and medical records in one
            secure platform.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="flex items-center gap-3 text-white/90">
              <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-sm">Role-based Access</p>
                <p className="text-xs text-white/60">Secure permissions</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-sm">Multi-role Support</p>
                <p className="text-xs text-white/60">Admin, Doctor, Nurse</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
                <Stethoscope className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-sm">Clinical Workflow</p>
                <p className="text-xs text-white/60">
                  Screening to prescription
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-sm text-white/50">
            © 2026 Dr.Note. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <Activity className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">Dr.Note</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-destructive shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@hospital.com"
                disabled={isLoading}
                className="h-11"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                disabled={isLoading}
                className="h-11"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-destructive mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          {/* Dev credentials */}
          <div className="rounded-lg bg-muted/50 border p-4">
            <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
              Demo Accounts
            </p>
            <div className="space-y-2 text-sm">
              {[
                {
                  role: "Admin",
                  email: "admin@drnote.com",
                  color: "bg-red-100 text-red-700",
                },
                {
                  role: "Doctor",
                  email: "doctor@drnote.com",
                  color: "bg-blue-100 text-blue-700",
                },
                {
                  role: "Nurse",
                  email: "nurse@drnote.com",
                  color: "bg-green-100 text-green-700",
                },
                {
                  role: "Receptionist",
                  email: "receptionist@drnote.com",
                  color: "bg-purple-100 text-purple-700",
                },
              ].map((account) => (
                <div
                  key={account.role}
                  className="flex items-center justify-between"
                >
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${account.color}`}
                  >
                    {account.role}
                  </span>
                  <span className="text-muted-foreground font-mono text-xs">
                    {account.email}
                  </span>
                </div>
              ))}
              <div className="pt-2 mt-2 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                  Password: <span className="font-mono">testpass123</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
