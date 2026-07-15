"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { RefreshCw } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

/** Inline error block with retry — design system §6. */
export function ProfileError({ message }: { message: string }) {
  const router = useRouter()

  useEffect(() => {
    toast.error(message)
  }, [message])

  return (
    <Card>
      <CardContent className="flex flex-col items-start gap-3 py-6">
        <p className="text-sm text-muted-foreground">
          Something went wrong — {message}
        </p>
        <Button type="button" variant="outline" size="sm" onClick={() => router.refresh()}>
          <RefreshCw />
          Retry
        </Button>
      </CardContent>
    </Card>
  )
}
