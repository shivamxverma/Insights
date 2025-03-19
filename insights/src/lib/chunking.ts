import natural from "natural";
import { quantile } from "d3-array";
import * as math from "mathjs";
import { generateEmbedding, generateEmbeddings } from "./embedding";

// Interfaces
export interface ChunkWithMetadata {
  text: string;
  metadata: { startIndex: number; endIndex: number };
}

interface SentenceObject {
  sentence: string;
  index: number;
  combined_sentence: string;
  embedding?: number[];
  distance_to_next?: number;
}

export interface ChunkingOptions {
  bufferSize?: number;
  mergeLengthThreshold?: number;
  cosineSimThreshold?: number;
  percentileThreshold?: number;
  maxSentencesPerBatch?: number;
  maxChunkLength?: number; // New: Maximum length for chunks
}

/**
 * Splits text into sentences using NLP.
 */
export function splitToSentences(text: string): string[] {
  const cleaned = text.replace(/\n+/g, " ").replace(/\s+/g, " ").trim();
  if (!cleaned) return [];
  const sentences = new natural.SentenceTokenizer(["Dr", "Mr", "Mrs", "Ms", "etc"])
    .tokenize(cleaned)
    .filter((s) => s.length > 0);
  // console.log(`Split text into ${sentences.length} sentences`);
  return sentences;
}

/**
 * Structures sentences with contextual buffers.
 */
export function structureSentences(sentences: string[], bufferSize: number = 2): SentenceObject[] {
  const result = sentences.map((sentence, i) => {
    const start = Math.max(0, i - bufferSize);
    const end = Math.min(sentences.length, i + bufferSize + 1);
    return {
      sentence,
      index: i,
      combined_sentence: sentences.slice(start, end).join(" "),
    };
  });
  // console.log(`Structured ${result.length} sentences with buffer size ${bufferSize}`);
  return result;
}

/**
 * Attaches embeddings to sentence objects in batches with error handling.
 */
export async function attachEmbeddings(sentences: SentenceObject[], batchSize: number = 50): Promise<SentenceObject[]> {
  const result = [];
  for (let i = 0; i < sentences.length; i += batchSize) {
    const batch = sentences.slice(i, i + batchSize);
    const texts = batch.map((s) => s.combined_sentence);
    try {
      const embeddings = await generateEmbeddings(texts, 10);
      if (embeddings.length !== batch.length) {
        throw new Error(`Embedding length mismatch: expected ${batch.length}, got ${embeddings.length}`);
      }
      result.push(...batch.map((s, j) => ({ ...s, embedding: embeddings[j] })));
      // console.log(`Attached embeddings to sentences ${i} to ${Math.min(i + batchSize - 1, sentences.length - 1)}`);
    } catch (error) {
      // console.error(`Error attaching embeddings for batch ${i} to ${i + batchSize - 1}:`, error);
      result.push(...batch.map((s) => ({ ...s, embedding: undefined }))); // Fallback to undefined embedding
    }
  }
  return result;
}

/**
 * Computes cosine similarity between two vectors.
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dot = math.dot(vecA, vecB) as number;
  const normA = math.norm(vecA) as number;
  const normB = math.norm(vecB) as number;
  return normA === 0 || normB === 0 ? 0 : dot / (normA * normB);
}

/**
 * Detects significant semantic shifts based on cosine distances.
 */
export function detectShifts(sentences: SentenceObject[], percentile: number = 90): number[] {
  const distances: number[] = [];
  for (let i = 0; i < sentences.length - 1; i++) {
    if (sentences[i].embedding && sentences[i + 1].embedding) {
      const sim = cosineSimilarity(sentences[i].embedding!, sentences[i + 1].embedding!);
      distances.push(1 - sim);
      sentences[i].distance_to_next = 1 - sim;
    }
  }
  if (distances.length === 0) return [];
  const threshold = quantile(distances.sort((a, b) => a - b), percentile / 100) || 0;
  const shifts = distances.map((d, i) => (d > threshold ? i : -1)).filter((i) => i !== -1);
  // console.log(`Detected ${shifts.length} significant shifts`);
  return shifts;
}

/**
 * Groups sentences into chunks based on shift indices with length constraint.
 */
export function groupIntoChunks(sentences: SentenceObject[], shifts: number[], maxChunkLength: number = 500): ChunkWithMetadata[] {
  const chunks: ChunkWithMetadata[] = [];
  let start = 0;
  let currentLength = 0;
  let chunkStart = 0;

  for (let i = 0; i <= sentences.length; i++) {
    if (i === sentences.length || shifts.includes(i - 1) || currentLength >= maxChunkLength) {
      if (start < i) {
        const group = sentences.slice(start, i);
        const text = group.map((s) => s.sentence).join(" ");
        chunks.push({
          text: text.length > maxChunkLength ? text.slice(0, maxChunkLength) : text,
          metadata: { startIndex: start, endIndex: i - 1 },
        });
        // console.log(`Created chunk from sentence ${start} to ${i - 1} with ${group.length} sentences`);
      }
      start = i;
      currentLength = 0;
      chunkStart = i;
    }
    if (i < sentences.length) {
      currentLength += sentences[i].sentence.length;
    }
  }
  return chunks;
}

/**
 * Merges adjacent chunks based on length and similarity with timeout.
 */
export async function mergeChunks(chunks: ChunkWithMetadata[], options: ChunkingOptions): Promise<ChunkWithMetadata[]> {
  const { mergeLengthThreshold = 200, cosineSimThreshold = 0.9, maxChunkLength = 500 } = options;
  const merged: ChunkWithMetadata[] = [chunks[0]];

  for (let i = 1; i < chunks.length; i++) {
    const last = merged[merged.length - 1];
    const current = chunks[i];

    const timeoutPromise = (promise: Promise<number[]>, ms: number) =>
      Promise.race([
        promise,
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Embedding timeout")), ms)),
      ]);

    try {
      const [lastEmb, currEmb] = await Promise.all([
        timeoutPromise(generateEmbedding(last.text), 5000),
        timeoutPromise(generateEmbedding(current.text), 5000),
      ]);
      const sim = cosineSimilarity(lastEmb, currEmb);
      // console.log(`Cosine similarity between chunks: ${sim}`);

      const combinedLength = last.text.length + current.text.length;
      if (combinedLength < mergeLengthThreshold && sim > cosineSimThreshold && combinedLength <= maxChunkLength) {
        // console.log(`Merging chunks due to short length: ${last.text.length} and ${current.text.length}`);
        merged[merged.length - 1] = {
          text: `${last.text} ${current.text}`,
          metadata: { startIndex: last.metadata.startIndex, endIndex: current.metadata.endIndex },
        };
        // console.log(`Merged chunk from ${last.metadata.startIndex} to ${current.metadata.endIndex}`);
      } else {
        merged.push(current);
      }
    } catch (error) {
      // console.error(`Error merging chunks at index ${i}:`, error);
      merged.push(current);
    }
  }
  // console.log(`Merging complete. Total chunks: ${merged.length}`);
  return merged;
}

/**
 * Processes text into chunks and embeddings with batching and error handling.
 */
export async function processText(
  text: string,
  options: ChunkingOptions = {
    bufferSize: 2,
    mergeLengthThreshold: 200,
    cosineSimThreshold: 0.9,
    percentileThreshold: 90,
    maxSentencesPerBatch: 100,
    maxChunkLength: 500,
  }
): Promise<{ chunks: ChunkWithMetadata[]; embeddings: number[][] }> {
  try {
    const sentences = splitToSentences(text);
    if (sentences.length === 0) {
      throw new Error("No sentences found in the input text");
    }

    const batches: SentenceObject[][] = [];
    const batchSize = options.maxSentencesPerBatch || 100;

    for (let i = 0; i < sentences.length; i += batchSize) {
      batches.push(structureSentences(sentences.slice(i, i + batchSize), options.bufferSize));
    }

    const allChunks: ChunkWithMetadata[] = [];
    const allEmbeddings: number[][] = [];

    for (let i = 0; i < batches.length; i++) {
      // console.log(`Processing batch ${i + 1}/${batches.length}`);
      const embedded = await attachEmbeddings(batches[i]);
      const shifts = detectShifts(embedded, options.percentileThreshold);
      const chunks = groupIntoChunks(embedded, shifts, options.maxChunkLength);
      const merged = await mergeChunks(chunks, options);

      allChunks.push(...merged);
      const embeddings = await generateEmbeddings(merged.map((c) => c.text));
      if (embeddings.length !== merged.length) {
        throw new Error(`Embedding length mismatch: expected ${merged.length}, got ${embeddings.length}`);
      }
      allEmbeddings.push(...embeddings);
    }

    // console.log(`Processed ${allChunks.length} final chunks`);
    return { chunks: allChunks, embeddings: allEmbeddings };
  } catch (error) {
    // console.error("Error processing text:", error);
    throw error;
  }
}
