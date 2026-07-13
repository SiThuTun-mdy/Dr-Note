"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"

import { setPassword } from "./actions"
import { setPasswordSchema, type SetPasswordInput } from "@/lib/validators/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

function LinkExpiredNotice() {
  const searchParams = useSearchParams()
  if (searchParams.get("error") !== "confirmation_failed") return null

  return (
    <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
      This link is invalid or has expired. Please ask the clinic to resend it.
    </div>
  )
}

export default function SetPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [canLogin, setCanLogin] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<SetPasswordInput>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  })

  async function onSubmit(values: SetPasswordInput) {
    setIsSubmitting(true)
    setError(null)
    try {
      const result = await setPassword(values)
      if (!result.success) {
        setError(result.error || "Unable to set your password. Please try again.")
        return
      }
      setCanLogin(result.canLogin ?? false)
      setDone(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-8">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Set your password</h1>
          <p className="text-muted-foreground text-sm">
            Choose a password for your Dr.Note account.
          </p>
        </div>

        {!done && (
          <Suspense fallback={null}>
            <LinkExpiredNotice />
          </Suspense>
        )}

        {done ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-primary/10 border border-primary/20 p-4 text-sm text-foreground">
              {canLogin
                ? "Your password has been set. Log in to get started."
                : "Your password has been set. Please contact the clinic to complete your account setup."}
            </div>
            {canLogin && (
              <Button className="w-full" render={<Link href="/login" />}>
                Go to login
              </Button>
            )}
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
                  {error}
                </div>
              )}

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New password</FormLabel>
                    <FormControl>
                      <Input type="password" disabled={isSubmitting} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm password</FormLabel>
                    <FormControl>
                      <Input type="password" disabled={isSubmitting} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Setting password...
                  </>
                ) : (
                  "Set password"
                )}
              </Button>
            </form>
          </Form>
        )}
      </div>
    </div>
  )
}
