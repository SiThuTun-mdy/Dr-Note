import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function PatientNotFound() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Patient not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This patient record doesn&apos;t exist or may have been removed.
      </p>
      <Button className="mt-4" nativeButton={false} render={<Link href="/" />}>
        Back to dashboard
      </Button>
    </div>
  )
}
