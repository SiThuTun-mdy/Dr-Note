import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Screening Vitals",
  description: "Record patient vitals before doctor consultation",
}

export default function ScreeningLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
