'use server'
import { prisma } from "./db";
import { retrieveAnswer } from "./retrieval";
import { Module } from "./types";


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
            name: true,
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

    // Transform the data to match the Module type
    const transformedData: Module[] = data.map((module) => ({
      id: module.id,
      name: module.name ?? "Unnamed Module", // Ensure name is a string
      videos: module.videos.map((video) => ({
        videoId: video.videoId,
        name: video.name ?? "Unnamed Video", // Ensure video name is a string
      })),
    }));

    return transformedData;
  } catch (error) {
    console.error("Error fetching module videos:", error);
    throw new Error("Failed to fetch module videos");
  }
}

export async function createWebScrapeProject(projectName: string, url: string, userId: string): Promise<string> {
  console.log("data", projectName, url, userId);
  try {
    const data = await prisma.webAnalysis.findFirst({
      where: { url },
    });
    if (data) {
      return data.id; // Return existing project's ID
    }
  } catch (error) {
    console.error("Error fetching project:", error);
    throw error;
  }

  try {
    const data = await prisma.webAnalysis.create({
      data: {
        name: projectName,
        url,
        userId,
        summary: "",
      },
    });
    console.log("Created project:", data);
    return data.id; // Return new project's ID
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
}

// Saves the summary for a project by ID
export async function SaveSummaryWebscraper(projectId: string, summary: string) {
  console.log("Saving scrape summary for project ID:", projectId);
  try {
    const existingRecord = await prisma.webAnalysis.findFirst({
      where: { id: projectId },
    });
    console.log("Existing record:", existingRecord);
    if (!existingRecord) {
      throw new Error(`No record found for project ID: ${projectId}`);
    }

    const data = await prisma.webAnalysis.update({
      where: { id: projectId },
      data: { summary },
    });
    console.log("Updated record:", data);
    return data;
  } catch (error) {
    console.error("Error saving summary:", error);
    throw error;
  }
}

// Retrieves the summary for a project by ID
export async function GetScrapeSumary(url: string) {
  try {
    const data = await prisma.webAnalysis.findFirst({
      where: { url: url },
      select: { summary: true,
        id : true
       },
    });
    return{
      summary : data ? data.summary : null,
      id : data ? data.id : null
    } 
  } catch (error) {
    console.error("Error fetching summary:", error);
    throw error;
  }
}
export async function GetScrapeSumaryThroughProjectId(projectId: string) {
  try {
    const data = await prisma.webAnalysis.findUnique({
      where: { id: projectId },
      select: { summary: true
       },
    });
    return data?.summary || null || "";
  } catch (error) {
    console.error("Error fetching summary:", error);
    throw error;
  }
}

export async function DeleteWebProject(projectId: string) {
  try {
    const deletedProject = await prisma.webAnalysis.delete({
      where: { id: projectId },
    });
    console.log("Deleted project:", deletedProject);
    return deletedProject;
  } catch (error) {
    console.error("Error deleting project:", error);
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
        id : id
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

export async function GetWebProject() {
  try {
    const data = await prisma.webAnalysis.findMany();
    return data;
  } catch (error) {
    console.error("Error fetching web projects:", error);
    throw error;
  }
}

export async function GetChatProject() {
  try {
    const data = await prisma.chatPdf.findMany()
    return data;
  } catch (error) {
    console.error("Error fetching chat projects:", error);
    throw error;
  }
}

export async function DeletechatPdfProject(projectId: string) {
  try {
    const deletedProject = await prisma.chatPdf.delete({
      where: { id: projectId },
    });
    console.log("Deleted project:", deletedProject);
    return deletedProject;
  } catch (error) {
    console.error("Error deleting project:", error);
    throw error;
  }
}

export async function chatPdfChatbot( query : string, namespace : string ){
   try {
    const res = await retrieveAnswer(query, namespace);
    return res;
  } catch (error) {
    console.error("Error fetching chat projects:", error);
    throw error;
   }
}

export async function chatPdfContent( projectId : string ){
  try {
    const data = await prisma.chatPdf.findUnique({
      where: { id: projectId },
      select: { content: true },
    });
    return data?.content || "No content available for this video.";
  } catch (error) {
    console.error("Error fetching chat projects:", error);
    throw error;
  }
}

export async function GetCourse(courseId : string){
  try {
    const data = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        units: {
          include: {
            chapters: {
              include: { courseQuiz: true },
            },
          },
        },
      },
    });
    return data;
  } catch (error) {
    console.error("Error fetching chat projects:", error);
    throw error;
  }
}