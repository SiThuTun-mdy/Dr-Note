import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Set Password",
  description: "Set your account password",
}

export default function SetPasswordLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
