import { redirect } from "next/navigation"

export default function Home() {
  // Redirect to agent dashboard
  redirect("/dashboard")
}
