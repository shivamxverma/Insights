'use server'
import { prisma } from "./db";

export async function addMynotes(notes: string, moduleId: string, videoId: string) {
  console.log("Module ID in addnotes:", moduleId, "Video ID:", videoId);
  console.log("Notes added:", notes);
  try {
    const data = await prisma.video.update({
      where: {
        moduleId_videoId: {
          moduleId,
          videoId,
        },
      },
      data: {
        note: notes,
      },
    });
    return data;
  } catch (error) {
    console.error("Error adding notes:", error);
    throw error; // Re-throw to allow caller to handle it
  }
}

export async function getNotes( moduleId: string, videoId: string) {
  console.log("Module ID in addnotes:", moduleId, "Video ID:", videoId);
  try {
    const data = await prisma.video.findFirst({
      where: {
          moduleId : moduleId,
          videoId : videoId,
      },
      select: {
        note: true,
      },
    });
    return data?.note;
  } catch (error) {
    console.error("Error adding notes:", error);
    throw error; // Re-throw to allow caller to handle it
  }
}
interface Video {
  videoId: string;
}

interface Module {
  id: string;
  name: string | null;
  videos: Video[] | null;
}
export async function fetchModuleVideos(userId: string): Promise<Module[]> {
  console.log("Fetching module videos for user:", userId);
  try {
    const data = await prisma.videoModule.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        videos: {
          select: {
            videoId: true,
          },
          orderBy: {
            createdAt: "asc",
          },
          take: 1, // Only get the first video for thumbnail
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return data.map((module) => ({
      id: module.id,
      name: module.name,
      videos: module.videos.map((video) => ({
        videoId: video.videoId,
      })),
    }));
  } catch (error) {
    console.error("Error fetching module videos:", error);
    throw new Error("Failed to fetch module videos");
  }
}

export async function createWebScrapeProject(projectName: string, url: string, userId: string) {
    console.log("data" , projectName, url, userId);
  try {
    const data = await prisma.webAnalysis.create({
      data: {
        name: projectName,
        url: url,
        userId: userId,
        summary: "",
      },
    });
    console.log("data" , data);
    return data.url;
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
}