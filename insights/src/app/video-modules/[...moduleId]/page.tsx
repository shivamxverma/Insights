import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import VideoLearningPageClient from "./videoCreate";
import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";

interface Props {
    params: Promise<{moduleId : string[]}>;
}

export default async function VideoLearningPage(props : Props) {
  const { moduleId } = await props.params;
  const session = await getAuthSession();
  if (!session) {
    redirect("/login");
  }

  const userId = session.user.id;
  const [courseId, videoId] = moduleId;

  console.log("Course ID:", courseId, "Video ID:", videoId);
  if(!courseId) {
    notFound();
  }
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

  let currentVideoIndex = 0;
  if(videoId) {
    currentVideoIndex = userModule.videos.findIndex((video) =>
    video.videoId.toLowerCase().trim() === videoId.toLowerCase().trim()
  ) ;
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