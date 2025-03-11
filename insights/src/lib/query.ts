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