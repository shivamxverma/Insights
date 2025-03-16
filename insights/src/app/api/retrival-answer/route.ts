"use server";
import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
import { NextResponse } from "next/server";
import { processText } from "@/lib/chunking";
import { prisma } from "@/lib/db";
import { retrieveAnswer } from "@/lib/retrieval";
import { uploadToPinecone } from "@/lib/pineconedb";
import md5 from "md5";

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const indexName = "insights";

/**
 * Checks if a vector is all zeros.
 */
function isZeroVector(vector: number[]): boolean {
  return vector.every((v) => v === 0);
}

export async function POST(req: Request) {
  const { query, namespace, moduleId , type} = await req.json();
  console.log("Received query: ", moduleId, namespace , type);
  try {
    if (!query || !namespace || !moduleId) {
      return NextResponse.json(
        { error: "query, namespace, and moduleId are required" },
        { status: 400 }
      );
    }

    console.log(`Received query: "${query}" for namespace: "${namespace}"`);

    let checkEmbedding  ;
    if(type === "video"){
       checkEmbedding = await prisma.video.findFirst({
      where: { videoId: namespace },
      select: { hasEmbedding: true },
    });
    }
    else {
        checkEmbedding = await prisma.chapter.findFirst({
        where: { id: moduleId },
        select: { hasEmbedding : true },
    }
        )}
    // If no data exists in Pinecone, generate and upload it
    if (checkEmbedding?.hasEmbedding !== true) {
      console.log(`No data found in Pinecone for namespace: ${namespace}, fetching from Prisma`);
        let transcript: string | null = null;
        if(type === "video"){
           const data = await prisma.video.findFirst({
            where: { videoId: namespace },
            select: { summary: true },
          });
          transcript = data?.summary ?? null;
        }
        else{
            const data = await prisma.chapter.findFirst({
            where: { id: moduleId },
            
          });
          console.log("Data: ", data);
          transcript = data?.transcript ?? null;
        }
        console.log("Transcript: ", transcript);
      if (transcript?.length === 0) {
        return NextResponse.json({ error: "No data found" }, { status: 404 });
      }

      if (!transcript) {
        return NextResponse.json({ error: "Transcript is null" }, { status: 400 });
      }

      console.log("Creating embeddings from video summary");
      const { chunks, embeddings } = await processText(transcript, {
        bufferSize: 2,  
        mergeLengthThreshold: 200,
        cosineSimThreshold: 0.9,
        percentileThreshold: 90,
        maxSentencesPerBatch: 300,
        maxChunkLength: 500,
      });
      console.log(`Processed ${chunks.length} chunks`);

      const validVectors: PineconeRecord[] = [];
      for (let index = 0; index < chunks.length; index++) {
        const embedding = embeddings[index];
        if (embedding && !isZeroVector(embedding)) {
          validVectors.push({
            id: md5(chunks[index].text),
            values: embedding,
            metadata: {
              text: chunks[index].text, // Will be truncated by sanitizeMetadata
              startIndex: chunks[index].metadata.startIndex,
              endIndex: chunks[index].metadata.endIndex,
              title: `${namespace}`,
              source: `https://www.youtube.com/watch?v=${namespace}`,
            },
          });
        } else {
          console.warn(`Skipping chunk ${index} due to invalid embedding`);
        }
      }
      console.log(`Prepared ${validVectors.length} valid vectors for Pinecone (filtered from ${chunks.length})`);

      console.log(`Uploading embeddings to Pinecone namespace: ${namespace}`);
      await uploadToPinecone(validVectors, namespace);
      console.log("Processing and uploading complete");

      if(type === "video"){
      await prisma.video.update({
        where: { moduleId_videoId: { moduleId: moduleId, videoId: namespace } },
        data: { hasEmbedding: true },
      });
    }
    else{
        await prisma.chapter.update({
        where: { id: moduleId },
        data: { hasEmbedding: true },
      });
    }
    }

    const content = await retrieveAnswer(query, namespace);
    return NextResponse.json({ content }, { status: 200 });
  } catch (error) {
    console.error("Error in /api/retrival-answer:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}