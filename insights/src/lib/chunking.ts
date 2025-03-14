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
  console.log(`Split text into ${sentences.length} sentences`);
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
  console.log(`Structured ${result.length} sentences with buffer size ${bufferSize}`);
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
      console.log(`Attached embeddings to sentences ${i} to ${Math.min(i + batchSize - 1, sentences.length - 1)}`);
    } catch (error) {
      console.error(`Error attaching embeddings for batch ${i} to ${i + batchSize - 1}:`, error);
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
  console.log(`Detected ${shifts.length} significant shifts`);
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
        console.log(`Created chunk from sentence ${start} to ${i - 1} with ${group.length} sentences`);
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
      console.log(`Cosine similarity between chunks: ${sim}`);

      const combinedLength = last.text.length + current.text.length;
      if (combinedLength < mergeLengthThreshold && sim > cosineSimThreshold && combinedLength <= maxChunkLength) {
        console.log(`Merging chunks due to short length: ${last.text.length} and ${current.text.length}`);
        merged[merged.length - 1] = {
          text: `${last.text} ${current.text}`,
          metadata: { startIndex: last.metadata.startIndex, endIndex: current.metadata.endIndex },
        };
        console.log(`Merged chunk from ${last.metadata.startIndex} to ${current.metadata.endIndex}`);
      } else {
        merged.push(current);
      }
    } catch (error) {
      console.error(`Error merging chunks at index ${i}:`, error);
      merged.push(current);
    }
  }
  console.log(`Merging complete. Total chunks: ${merged.length}`);
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
      console.log(`Processing batch ${i + 1}/${batches.length}`);
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

    console.log(`Processed ${allChunks.length} final chunks`);
    return { chunks: allChunks, embeddings: allEmbeddings };
  } catch (error) {
    console.error("Error processing text:", error);
    throw error;
  }
}
// // chunking.ts
// import natural from 'natural';
// import { quantile } from 'd3-array';
// import * as math from 'mathjs';
// import { generateEmbedding, generateEmbeddings } from './embedding';

// // Interfaces
// export interface ChunkWithMetadata {
//   text: string;
//   metadata: { startIndex: number; endIndex: number };
// }

// interface SentenceObject {
//   sentence: string;
//   index: number;
//   combined_sentence: string;
//   embedding?: number[];
//   distance_to_next?: number;
// }

// export interface ChunkingOptions {
//   bufferSize?: number;
//   mergeLengthThreshold?: number;
//   cosineSimThreshold?: number;
//   percentileThreshold?: number;
//   maxSentencesPerBatch?: number; // New: Limit sentences processed at once
// }
// /**
//  * Splits text into sentences using NLP.
//  */
// export function splitToSentences(text: string): string[] {
//   const cleaned = text.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
//   if (!cleaned) return [];
//   const sentences = new natural.SentenceTokenizer(['Dr', 'Mr', 'Mrs', 'Ms', 'etc']).tokenize(cleaned).filter(s => s.length > 0);
//   console.log(`Split text into ${sentences.length} sentences`);
//   return sentences;
// }

// /**
//  * Structures sentences with contextual buffers.
//  */
// export function structureSentences(sentences: string[], bufferSize: number = 1): SentenceObject[] {
//   const result = sentences.map((sentence, i) => {
//     const start = Math.max(0, i - bufferSize);
//     const end = Math.min(sentences.length, i + bufferSize + 1);
//     return {
//       sentence,
//       index: i,
//       combined_sentence: sentences.slice(start, end).join(" "),
//     };
//   });
//   console.log(`Structured ${result.length} sentences with buffer size ${bufferSize}`);
//   return result;
// }

// /**
//  * Attaches embeddings to sentence objects in batches.
//  */
// export async function attachEmbeddings(sentences: SentenceObject[], batchSize: number = 100): Promise<SentenceObject[]> {
//   const result = [];
//   for (let i = 0; i < sentences.length; i += batchSize) {
//     const batch = sentences.slice(i, i + batchSize);
//     const texts = batch.map(s => s.combined_sentence);
//     const embeddings = await generateEmbeddings(texts, 10); // Smaller internal batch for API
//     result.push(...batch.map((s, j) => ({ ...s, embedding: embeddings[j] })));
//     console.log(`Attached embeddings to sentences ${i} to ${Math.min(i + batchSize - 1, sentences.length - 1)}`);
//   }
//   return result;
// }

// /**
//  * Computes cosine similarity between two vectors.
//  */
// export function cosineSimilarity(vecA: number[], vecB: number[]): number {
//   const dot = math.dot(vecA, vecB) as number;
//   const normA = math.norm(vecA) as number;
//   const normB = math.norm(vecB) as number;
//   return (normA === 0 || normB === 0) ? 0 : dot / (normA * normB);
// }

// /**
//  * Detects significant semantic shifts based on cosine distances.
//  */
// export function detectShifts(sentences: SentenceObject[], percentile: number = 90): number[] {
//   const distances: number[] = [];
//   for (let i = 0; i < sentences.length - 1; i++) {
//     if (sentences[i].embedding && sentences[i + 1].embedding) {
//       const sim = cosineSimilarity(sentences[i].embedding!, sentences[i + 1].embedding!);
//       distances.push(1 - sim);
//       sentences[i].distance_to_next = 1 - sim;
//     }
//   }
//   if (distances.length === 0) return [];
//   const threshold = quantile(distances.sort((a, b) => a - b), percentile / 100) || 0;
//   const shifts = distances.map((d, i) => (d > threshold ? i : -1)).filter(i => i !== -1);
//   console.log(`Detected ${shifts.length} significant shifts`);
//   return shifts;
// }

// /**
//  * Groups sentences into chunks based on shift indices.
//  */
// export function groupIntoChunks(sentences: SentenceObject[], shifts: number[]): ChunkWithMetadata[] {
//   const chunks: ChunkWithMetadata[] = [];
//   let start = 0;
//   for (const end of [...shifts, sentences.length - 1]) {
//     const group = sentences.slice(start, end + 1);
//     chunks.push({
//       text: group.map(s => s.sentence).join(" "),
//       metadata: { startIndex: start, endIndex: end },
//     });
//     console.log(`Created chunk from sentence ${start} to ${end} with ${group.length} sentences`);
//     start = end + 1;
//   }
//   return chunks;
// }

// /**
//  * Merges adjacent chunks based on length and similarity with timeout.
//  */
// export async function mergeChunks(chunks: ChunkWithMetadata[], options: ChunkingOptions): Promise<ChunkWithMetadata[]> {
//   const { mergeLengthThreshold = 300, cosineSimThreshold = 0.9 } = options;
//   const merged: ChunkWithMetadata[] = [chunks[0]];
  
//   for (let i = 1; i < chunks.length; i++) {
//     const last = merged[merged.length - 1];
//     const current = chunks[i];
    
//     // Timeout wrapper for embedding generation
//     const timeoutPromise = (promise: Promise<number[]>, ms: number) =>
//       Promise.race([
//         promise,
//         new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Embedding timeout")), ms)),
//       ]);
    
//     try {
//       const [lastEmb, currEmb] = await Promise.all([
//         timeoutPromise(generateEmbedding(last.text), 5000),
//         timeoutPromise(generateEmbedding(current.text), 5000),
//       ]);
//       const sim = cosineSimilarity(lastEmb, currEmb);
//       console.log(`Cosine similarity between chunks: ${sim}`);
      
//       if ((last.text.length < mergeLengthThreshold || current.text.length < mergeLengthThreshold) && sim > cosineSimThreshold) {
//         console.log(`Merging chunks due to short length: ${last.text.length} and ${current.text.length}`);
//         merged[merged.length - 1] = {
//           text: `${last.text} ${current.text}`,
//           metadata: { startIndex: last.metadata.startIndex, endIndex: current.metadata.endIndex },
//         };
//         console.log(`Merged chunk from ${last.metadata.startIndex} to ${current.metadata.endIndex}`);
//       } else {
//         merged.push(current);
//       }
//     } catch (error) {
//       console.error(`Error merging chunks at index ${i}:`, error);
//       merged.push(current); // Skip merge on error
//     }
//   }
//   console.log(`Merging complete. Total chunks: ${merged.length}`);
//   return merged;
// }

// /**
//  * Processes text into chunks and embeddings with batching.
//  */export async function processText(
//   text: string,
//   options: ChunkingOptions = { bufferSize: 1, mergeLengthThreshold: 300, cosineSimThreshold: 0.8, percentileThreshold: 90, maxSentencesPerBatch: 500 }
// ): Promise<{ chunks: ChunkWithMetadata[]; embeddings: number[][] }> {
//   const sentences = splitToSentences(text);
//   const batches: SentenceObject[][] = [];
//   const batchSize = options.maxSentencesPerBatch || 500;

//   for (let i = 0; i < sentences.length; i += batchSize) {
//     batches.push(structureSentences(sentences.slice(i, i + batchSize), options.bufferSize));
//   }

//   const allChunks: ChunkWithMetadata[] = [];
//   const allEmbeddings: (number[] | null)[] = []; // Allow null embeddings

//   for (let i = 0; i < batches.length; i++) {
//     console.log(`Processing batch ${i + 1}/${batches.length}`);
//     const embedded = await attachEmbeddings(batches[i]);
//     const shifts = detectShifts(embedded, options.percentileThreshold);
//     const chunks = groupIntoChunks(embedded, shifts);
//     const merged = await mergeChunks(chunks, options);

//     allChunks.push(...merged);
//     const embeddings = await generateEmbeddings(merged.map(c => c.text));
//     allEmbeddings.push(...embeddings);
//   }

//   console.log(`Processed ${allChunks.length} final chunks`);
//   return { chunks: allChunks, embeddings: allEmbeddings as number[][] }; // Type assertion for simplicity
// }
// // import { GoogleGenerativeAI } from '@google/generative-ai';
// // import natural from 'natural';
// // import { quantile } from 'd3-array';
// // import * as math from 'mathjs';
// // import { generateEmbedding, generateEmbeddings } from './embedding';
// // import dotenv from 'dotenv';
// // dotenv.config();

// // // Instantiate a generative model once.
// // const generativeModel = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string)
// //   .getGenerativeModel({ model: "text-bison-001" });

// // // In-memory cache for embeddings.
// // const embeddingCache = new Map<string, number[]>();

// // // Cached wrapper for generating a single embedding.
// // export async function cachedGenerateEmbedding(text: string): Promise<number[]> {
// //   if (embeddingCache.has(text)) {
// //     console.log("Using cached embedding for text:", text.substring(0, 30));
// //     return embeddingCache.get(text)!;
// //   }
// //   const emb = await generateEmbedding(text);
// //   embeddingCache.set(text, emb);
// //   return emb;
// // }

// // // Cached wrapper for generating embeddings in batch.
// // export async function cachedGenerateEmbeddings(texts: string[], batchSize: number): Promise<number[][]> {
// //   const embeddings: number[][] = new Array(texts.length);
// //   const textsToFetch: string[] = [];
// //   const indexesToFetch: number[] = [];
  
// //   for (let i = 0; i < texts.length; i++) {
// //     const text = texts[i];
// //     if (embeddingCache.has(text)) {
// //       console.log("Using cached embedding for text:", text.substring(0, 30));
// //       embeddings[i] = embeddingCache.get(text)!;
// //     } else {
// //       textsToFetch.push(text);
// //       indexesToFetch.push(i);
// //     }
// //   }
  
// //   if (textsToFetch.length > 0) {
// //     const newEmbeddings = await generateEmbeddings(textsToFetch, batchSize);
// //     for (let j = 0; j < textsToFetch.length; j++) {
// //       embeddingCache.set(textsToFetch[j], newEmbeddings[j]);
// //       embeddings[indexesToFetch[j]] = newEmbeddings[j];
// //     }
// //   }
  
// //   return embeddings;
// // }

// // // Interfaces
// // export interface SentenceObject {
// //   sentence: string;
// //   index: number;
// //   combined_sentence?: string;
// //   combined_sentence_embedding?: number[];
// //   distance_to_next?: number;
// // }

// // export interface ChunkingOptions {
// //   bufferSize?: number; // Context window size.
// //   mergeLengthThreshold?: number; // Threshold for merging short chunks.
// //   cosineSimThreshold?: number; // Cosine similarity threshold for merging.
// //   percentileThreshold?: number; // Percentile for semantic shift detection.
// //   useLLMForMerge?: boolean; // Whether to use LLM-based merge decisions.
// // }

// // export interface ChunkWithMetadata {
// //   text: string;
// //   metadata: {
// //     startIndex: number;
// //     endIndex: number;
// //   };
// // }

// // // Split text into sentences using natural language processing.
// // export function splitToSentencesUsingNLP(text: string): string[] {
// //   const cleanedText = text.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
// //   if (!cleanedText) return [];
// //   const tokenizer = new natural.SentenceTokenizer([]);
// //   const sentences = tokenizer.tokenize(cleanedText);
// //   console.log(`Tokenized into ${sentences.length} sentences.`);
// //   return sentences.map(s => s.trim()).filter(s => s.length > 0);
// // }

// // // Structure sentences with a surrounding buffer for context.
// // export function structureSentences(sentences: string[], bufferSize: number = 1): SentenceObject[] {
// //   const sentenceObjects: SentenceObject[] = sentences.map((sentence, i) => ({
// //     sentence,
// //     index: i,
// //   }));
// //   sentenceObjects.forEach((obj, i) => {
// //     let combined = "";
// //     for (let j = i - bufferSize; j < i; j++) {
// //       if (j >= 0) combined += sentenceObjects[j].sentence + " ";
// //     }
// //     combined += obj.sentence + " ";
// //     for (let j = i + 1; j <= i + bufferSize; j++) {
// //       if (j < sentenceObjects.length) combined += sentenceObjects[j].sentence + " ";
// //     }
// //     obj.combined_sentence = combined.trim();
// //   });
// //   console.log(`Structured sentences with buffer size = ${bufferSize}.`);
// //   return sentenceObjects;
// // }

// // // Generate and attach embeddings for each structured sentence in parallel.
// // export async function generateAndAttachEmbeddings(sentenceObjects: SentenceObject[]): Promise<SentenceObject[]> {
// //   await Promise.all(
// //     sentenceObjects.map(async (obj, i) => {
// //       if (obj.combined_sentence) {
// //         try {
// //           const embedding = await cachedGenerateEmbedding(obj.combined_sentence);
// //           obj.combined_sentence_embedding = embedding;
// //           console.log(`Generated embedding for sentence index ${i}.`);
// //         } catch (error) {
// //           console.error(`Error generating embedding for sentence at index ${i}:`, error);
// //         }
// //       }
// //     })
// //   );
// //   return sentenceObjects;
// // }

// // // Compute cosine similarity between two vectors.
// // export function cosineSimilarity(vecA: number[], vecB: number[]): number {
// //   const dotProduct = math.dot(vecA, vecB) as number;
// //   const normA = math.norm(vecA) as number;
// //   const normB = math.norm(vecB) as number;
// //   if (normA === 0 || normB === 0) return 0;
// //   return dotProduct / (normA * normB);
// // }

// // // Compute cosine distances between adjacent sentence embeddings and detect significant shifts.
// // export function calculateCosineDistancesAndSignificantShifts(
// //   sentenceObjects: SentenceObject[],
// //   percentileThreshold: number = 90
// // ): { updatedArray: SentenceObject[]; significantShiftIndices: number[] } {
// //   const distances: number[] = [];
// //   const updatedArray = sentenceObjects.map((obj, index, arr) => {
// //     if (
// //       index < arr.length - 1 &&
// //       obj.combined_sentence_embedding &&
// //       arr[index + 1].combined_sentence_embedding
// //     ) {
// //       const sim = cosineSimilarity(obj.combined_sentence_embedding!, arr[index + 1].combined_sentence_embedding!);
// //       const distance = 1 - sim;
// //       distances.push(distance);
// //       return { ...obj, distance_to_next: distance };
// //     }
// //     return { ...obj, distance_to_next: undefined };
// //   });
  
// //   if (distances.length === 0) {
// //     console.warn("No distances computed; returning empty significant shift indices.");
// //     return { updatedArray, significantShiftIndices: [] };
// //   }
  
// //   const sortedDistances = [...distances].sort((a, b) => a - b);
// //   const quantileThreshold = percentileThreshold / 100;
// //   const breakpointDistanceThreshold = quantile(sortedDistances, quantileThreshold);
// //   if (breakpointDistanceThreshold === undefined) {
// //     throw new Error("Failed to calculate breakpoint distance threshold");
// //   }
// //   const significantShiftIndices = distances
// //     .map((d, i) => (d > breakpointDistanceThreshold ? i : -1))
// //     .filter(i => i !== -1);
// //   console.log(`Calculated significant shifts at indices: ${significantShiftIndices}`);
// //   return { updatedArray, significantShiftIndices };
// // }

// // // Group sentences into chunks based on significant shifts.
// // export function groupSentencesIntoChunks(
// //   sentenceObjects: SentenceObject[],
// //   shiftIndices: number[]
// // ): ChunkWithMetadata[] {
// //   let startIdx = 0;
// //   const chunks: ChunkWithMetadata[] = [];
// //   const breakpoints = [...shiftIndices, sentenceObjects.length - 1];
// //   for (const breakpoint of breakpoints) {
// //     const group = sentenceObjects.slice(startIdx, breakpoint + 1);
// //     const combinedText = group.map(obj => obj.sentence).join(" ");
// //     chunks.push({
// //       text: combinedText,
// //       metadata: { startIndex: startIdx, endIndex: breakpoint }
// //     });
// //     console.log(`Chunk from sentence ${startIdx} to ${breakpoint} with ${group.length} sentences.`);
// //     startIdx = breakpoint + 1;
// //   }
// //   return chunks;
// // }

// // // LLM-based merge decision using the global generative model.
// // async function shouldMergeChunksLLM(chunkA: string, chunkB: string): Promise<boolean> {
// //   console.log("Using LLM-based merge decision.");
// //   const prompt = `You are a content merging assistant. Given two text chunks, decide if they should be merged to preserve context and coherence.

// // Chunk A: "${chunkA}"

// // Chunk B: "${chunkB}"

// // Please respond with a JSON object in the following format (without any additional text):
// // {"merge": true} or {"merge": false}`;
// //   try {
// //     const result = await generativeModel.generateContent(prompt);
// //     const responseText = result.response.text();
// //     console.log("LLM response:", responseText);
// //     const parsed = JSON.parse(responseText);
// //     if (typeof parsed.merge === 'boolean') {
// //       return parsed.merge;
// //     }
// //     console.error("Unexpected response format from LLM:", responseText);
// //     return shouldMergeChunksHeuristic(chunkA, chunkB);
// //   } catch (error) {
// //     console.error("Error using LLM for merge decision:", error);
// //     return shouldMergeChunksHeuristic(chunkA, chunkB);
// //   }
// // }

// // // Heuristic-based merge decision.
// // async function shouldMergeChunksHeuristic(
// //   chunkA: string,
// //   chunkB: string,
// //   mergeLengthThreshold: number = 300,
// //   cosineSimThreshold: number = 0.9
// // ): Promise<boolean> {
// //   if (chunkA.length < mergeLengthThreshold && chunkB.length < mergeLengthThreshold) {
// //     console.log(`Merging chunks due to short length: ${chunkA.length} and ${chunkB.length}`);
// //     return true;
// //   }
// //   try {
// //     const [embeddingA, embeddingB] = await Promise.all([
// //       cachedGenerateEmbedding(chunkA),
// //       cachedGenerateEmbedding(chunkB)
// //     ]);
// //     const sim = cosineSimilarity(embeddingA, embeddingB);
// //     console.log(`Cosine similarity between chunks: ${sim}`);
// //     return sim > cosineSimThreshold;
// //   } catch (error) {
// //     console.error("Error in merging decision heuristic:", error);
// //     return false;
// //   }
// // }

// // // Decide whether to merge two chunks.
// // export async function shouldMergeChunks(
// //   chunkA: string,
// //   chunkB: string,
// //   options: ChunkingOptions
// // ): Promise<boolean> {
// //   if (options.useLLMForMerge) {
// //     return shouldMergeChunksLLM(chunkA, chunkB);
// //   } else {
// //     return shouldMergeChunksHeuristic(
// //       chunkA,
// //       chunkB,
// //       options.mergeLengthThreshold,
// //       options.cosineSimThreshold
// //     );
// //   }
// // }

// // // Merge adjacent chunks agentically.
// // export async function agenticMergeChunks(
// //   chunks: ChunkWithMetadata[],
// //   options: ChunkingOptions
// // ): Promise<ChunkWithMetadata[]> {
// //   if (chunks.length === 0) return [];
// //   const mergedChunks: ChunkWithMetadata[] = [];
// //   let currentChunk = chunks[0];
// //   for (let i = 1; i < chunks.length; i++) {
// //     const candidate = chunks[i];
// //     const mergeDecision = await shouldMergeChunks(currentChunk.text, candidate.text, options);
// //     if (mergeDecision) {
// //       console.log(`Merging chunk from ${currentChunk.metadata.startIndex} to ${candidate.metadata.endIndex}.`);
// //       currentChunk = {
// //         text: currentChunk.text + " " + candidate.text,
// //         metadata: {
// //           startIndex: currentChunk.metadata.startIndex,
// //           endIndex: candidate.metadata.endIndex,
// //         }
// //       };
// //     } else {
// //       mergedChunks.push(currentChunk);
// //       currentChunk = candidate;
// //     }
// //   }
// //   mergedChunks.push(currentChunk);
// //   console.log(`Agentic merging complete. ${mergedChunks.length} chunks remain.`);
// //   return mergedChunks;
// // }

// // // Optional secondary reassessment.
// // export async function secondaryReassessment(chunks: ChunkWithMetadata[]): Promise<ChunkWithMetadata[]> {
// //   console.log("Secondary reassessment not implemented. Returning original chunks.");
// //   return chunks;
// // }

// // // Aggregate an array of embeddings by averaging each dimension.
// // export function aggregateEmbeddings(embeddings: number[][]): number[] {
// //   if (embeddings.length === 0) return [];
// //   const dims = embeddings[0].length;
// //   const avg = new Array(dims).fill(0);
// //   for (const emb of embeddings) {
// //     for (let i = 0; i < dims; i++) {
// //       avg[i] += emb[i];
// //     }
// //   }
// //   for (let i = 0; i < dims; i++) {
// //     avg[i] /= embeddings.length;
// //   }
// //   console.log("Aggregated embedding computed.");
// //   return avg;
// // }

// // // Main processing function: tokenizes, structures, attaches embeddings, groups, merges, and generates final embeddings.
// // export async function processTextToEmbeddings(
// //   text: string,
// //   options: ChunkingOptions = {
// //     bufferSize: 1,
// //     mergeLengthThreshold: 300,
// //     cosineSimThreshold: 0.8,
// //     percentileThreshold: 90,
// //     useLLMForMerge: false,
// //   }
// // ): Promise<{
// //   chunks: ChunkWithMetadata[];
// //   chunkEmbeddings: number[][];
// // }> {
// //   // Step 1: Tokenize and structure.
// //   const sentences = splitToSentencesUsingNLP(text);
// //   const structured = structureSentences(sentences, options.bufferSize);
// //   const withEmbeddings = await generateAndAttachEmbeddings(structured);
// //   const { updatedArray, significantShiftIndices } = calculateCosineDistancesAndSignificantShifts(withEmbeddings, options.percentileThreshold);
  
// //   // Group into preliminary chunks.
// //   const preliminaryChunks = groupSentencesIntoChunks(updatedArray, significantShiftIndices);
  
// //   // Step 2: Merge chunks agentically.
// //   const mergedChunks = await agenticMergeChunks(preliminaryChunks, options);
  
// //   // Step 3: Optional secondary reassessment.
// //   const finalChunks = await secondaryReassessment(mergedChunks);
  
// //   // Step 4: Generate embeddings for final chunks using caching.
// //   const textsForEmbedding = finalChunks.map(chunk => chunk.text);
// //   const chunkEmbeddings = await cachedGenerateEmbeddings(textsForEmbedding, 3);
// //   console.log("Final processing complete.");
  
// //   return {
// //     chunks: finalChunks,
// //     chunkEmbeddings,
// //   };
// // }
