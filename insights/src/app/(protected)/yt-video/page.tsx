
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db" 
import { getAuthSession } from "@/lib/auth"
import CreateVideoClient from "./createVideo"

export default async function CreateVideoPage() {
  const session = await getAuthSession()
  if (!session) {
    redirect("/login")
  }
  const userId = session.user.id

  const modules = []

  return (
    <CreateVideoClient userId={userId} modules={modules} />
  )
}