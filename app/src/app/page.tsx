import { redirect } from "next/navigation"

export default function Home() {
  // Redirect to login - middleware will handle auth check
  redirect("/login")
}
