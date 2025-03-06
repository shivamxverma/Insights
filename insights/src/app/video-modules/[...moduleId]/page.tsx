import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import VideoLearningPageClient from "./videoCreate";
import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

export default async function VideoLearningPage({ params }: { params: { moduleId: string[] } }) {
  const session = await getAuthSession();
  if (!session) {
    redirect("/login");
  }

  const userId = session.user.id;
  const [courseId, videoId] = params.moduleId;

  console.log("Course ID:", courseId, "Video ID:", videoId);
  if(!courseId) {
    notFound();
  }
  // if(!videoId) {
  //   // redirect(`/video-modules/${courseId}`);
  // }
  // Fetch the current module with its videos
  let userModule = await prisma.videoModule.findFirst({
    where: {
      userId,
      OR: [{ id: courseId }, { originalModuleId: courseId }],
    },
    include: { videos: true },
  });

  if (!userModule) {
    const originalModule = await prisma.videoModule.findUnique({
      where: { id: courseId },
      include: { videos: true },
    });

    if (!originalModule) {
      notFound();
    }

    userModule = await prisma.videoModule.create({
      data: {
        userId,
        name: originalModule.name + " (Shared)",
        originalModuleId: originalModule.id,
        videos: {
          create: originalModule.videos.map((video) => ({
            name: video.name,
            url: video.url,
            videoId: video.videoId,
            summary: video.summary,
          })),
        },
      },
      include: { videos: true },
    });

    redirect(`/video-modules/${videoId}`);
  }

  if (!userModule.videos.length) {
    notFound();
  }

  // Find the current video index using the videoId field
  const currentVideoIndex = userModule.videos.findIndex((video) =>
    video.videoId.toLowerCase().trim() === videoId.toLowerCase().trim()
  );
  if (currentVideoIndex === -1) {
    console.error(
      "Video not found in module. Available videoIds:",
      userModule.videos.map((v) => v.videoId),
      "Searched videoId:",
      videoId
    );
    notFound();
  }

  console.log("Current Video Index:", currentVideoIndex);

  return (
    <VideoLearningPageClient
      courseId={courseId}
      module={userModule}
      currentVideoIndex={currentVideoIndex}
    />
  );
}