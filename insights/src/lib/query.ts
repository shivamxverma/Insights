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
          orderBy:{
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

export async function createWebScrapeProject(projectName: string, url: string, userId: string): Promise<string> {
    console.log("data" , projectName, url, userId);
    try {
      const data = await prisma.webAnalysis.findFirst({
        where: {
          url: url,
        },
      })
      if(data){
        return data.url;
      }
    }
    catch (error) {
      console.error("Error fetching summary:", error);
      throw error;
    }
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

export async function SaveSummaryWebscraper(url: string, summary: string) {
  console.log("Saving summary for URL:", url);
  try {
    const data = await prisma.webAnalysis.update({
      where: { url },
      data: { summary },
    });
    return data;
  } catch (error) {
    console.error("Error saving summary:", error);
    throw error;
  }
}

export async function GetScrapeSumary(url: string): Promise<string | null> {
  try {
    const data: { summary: string | null } | null = await prisma.webAnalysis.findFirst({
      where: {
      url: url,
      },
      select: {
      summary: true,
      },
    });
    return data ? data.summary : null;
  }
  catch (error) {
    console.error("Error fetching summary:", error);
    throw error;
  }
}

export async function DeleteVideo(id: string) {
  console.log("Deleting video with ID:", id);
  try {
    const data = await prisma.video.delete({
      where: {
        id
      },
    });
    if(data){
      return {
        success : true,
        message : "Video deleted successfully",
        data : data
      }
    }
    return {
      success : false,
      message : "Video not found",
      data : null
    }
  } catch (error) {
    console.error("Error deleting video:", error);
    return {
      success : false,
      message : "Error deleting video",
      data : error
    }
  }
}

export async function DeleteModule(id: string) {
  console.log("Deleting module with ID:", id);
  try {
    const data = await prisma.videoModule.delete({
      where: {
        id
      },
    });
    if(data){
      return {
        success : true,
        message : "module deleted successfully",
        data : data
      }
    }
    return {
      success : false,
      message : "module not found",
      data : null
    }
  } catch (error) {
    console.error("Error deleting module:", error);
    throw error;
  }
}