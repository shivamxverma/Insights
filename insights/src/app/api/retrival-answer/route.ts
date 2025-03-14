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
  try {
    const { query, namespace, moduleId } = await req.json();
    console.log("Received query: ", moduleId, namespace);
    if (!query || !namespace || !moduleId) {
      return NextResponse.json(
        { error: "query, namespace, and moduleId are required" },
        { status: 400 }
      );
    }

    console.log(`Received query: "${query}" for namespace: "${namespace}"`);

    const checkEmbedding = await prisma.video.findFirst({
      where: { videoId: namespace },
      select: { embeddingCreated: true },
    });

    // If no data exists in Pinecone, generate and upload it
    if (checkEmbedding?.embeddingCreated !== true) {
      console.log(`No data found in Pinecone for namespace: ${namespace}, fetching from Prisma`);

      const transcript = await prisma.video.findFirst({
        where: { videoId: namespace },
        select: { summary: true },
      });

      if (!transcript) {
        return NextResponse.json({ error: "No data found" }, { status: 404 });
      }
      if (!transcript.summary) {
        return NextResponse.json({ error: "No summary found" }, { status: 404 });
      }

      console.log("Creating embeddings from video summary");
      const { chunks, embeddings } = await processText(transcript.summary, {
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

      await prisma.video.update({
        where: { moduleId_videoId: { moduleId: moduleId, videoId: namespace } },
        data: { embeddingCreated: true },
      });
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