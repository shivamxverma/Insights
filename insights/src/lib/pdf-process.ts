"use server";
import pdfParse from "pdf-parse";

import { getAuthSession } from "./auth";
import { prisma } from "./db";
import { processText, ChunkWithMetadata } from "./chunking";
import md5 from "md5";
import { uploadToPinecone } from "./pineconedb";
import { redirect } from "next/navigation";
import { PineconeRecord } from "@pinecone-database/pinecone";
import { generateSummary } from "./gemini";

/**
 * Checks if a vector is all zeros.
 */
function isZeroVector(vector: number[]): boolean {
  return vector.every(v => v === 0);
}

/**
 * Uploads a PDF, processes it, and stores embeddings in Pinecone.
 */
export async function uploadPDF(pdf: File | null) {
  const session = await getAuthSession();
  if (!session?.user) {
    redirect("/login");
  }

  if (!pdf) {
    return { error: "PDF file is required" };
  }

  const existingProject = await prisma.chatPdf.findFirst({
    where: { name: pdf.name },
  });
  if (existingProject) {
    redirect(`/document/${existingProject.id}`);
  }

  let newProject: { id: string } | undefined = undefined;
  try {
    // console.log(`Received file for upload: ${pdf.name}, size: ${pdf.size} bytes`);

    const arrayBuffer = await pdf.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    // console.log(`Converted file to buffer, length: ${buffer.length} bytes`);

    const pdfData = await pdfParse(buffer);
    const extractedText = pdfData.text.trim();
    if (!extractedText) {
      return { error: "Extracted text is empty" };
    }
    // console.log(`Extracted text, length: ${extractedText.length} characters`);

    const summarizedText =  await generateSummary(extractedText);
    newProject = await prisma.chatPdf.create({
      data: {
        name: pdf.name,
        content: summarizedText,
        userId: session.user.id,
      },
    });
    // console.log(`Created new project: ${newProject.id}`);

    const { chunks, embeddings } = await processText(extractedText, {
      bufferSize: 1,
      mergeLengthThreshold: 300,
      cosineSimThreshold: 0.8,
      percentileThreshold: 90,
      maxSentencesPerBatch: 500,
    });
    // console.log(`Processed ${chunks.length} chunks`);

    if (!newProject) {
      throw new Error("New project creation failed");
    }

    // Filter out invalid (null or zero) embeddings
    const validVectors: PineconeRecord[] = [];
    for (let index = 0; index < chunks.length; index++) {
      const embedding = embeddings[index];
      if (embedding && !isZeroVector(embedding)) {
        validVectors.push({
          id: md5(chunks[index].text),
          values: embedding,
          metadata: {
            text: chunks[index].text,
            startIndex: chunks[index].metadata.startIndex,
            endIndex: chunks[index].metadata.endIndex,
            title: "PDF Document",
            description: "PDF document",
            timestamp: new Date().toISOString(),
            userId: session.user.id,
            projectId: newProject.id,
          },
        });
      } else {
        // console.warn(`Skipping chunk ${index} due to invalid embedding`);
      }
    }
    // console.log(`Prepared ${validVectors.length} valid vectors for Pinecone (filtered from ${chunks.length})`);

    const namespace =  newProject.id;
    // console.log(`Uploading embeddings to Pinecone namespace: ${namespace}`);
    await uploadToPinecone(validVectors, namespace);
    // console.log("Processing and uploading complete");
  } catch (error) {
    // console.error("Error processing PDF:", error);
    return { error: "Failed to process PDF" };
  }

  redirect(`/document/${newProject!.id}`);
}