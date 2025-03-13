import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import DashboardClient from "./DashboardClient";
import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

export default async function Dashboard() {
  const session = await getAuthSession();
  if (!session) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Fetch all video modules for the current user
  const userModules = await prisma.videoModule.findMany({
    where: {
      userId,
    },
    include: {
      videos: true,
    },
  });

  if (!userModules || userModules.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <p>No modules found. Create or join a module to get started!</p>
      </div>
    );
  }

  return <DashboardClient modules={userModules} />;
}