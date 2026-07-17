import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Waiting",
  description: "Patients currently waiting",
}

export default function WaitingPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Waiting</h1>
      <p className="text-muted-foreground">Waiting queue coming soon.</p>
    </div>
  )
}
