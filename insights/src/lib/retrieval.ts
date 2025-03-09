import { Pinecone } from "@pinecone-database/pinecone";
import { generateEmbedding } from './embedding';
import { refineQuery, generateFinalAnswer } from './geminiAPI';
import dotenv from 'dotenv';

dotenv.config();

export async function searchEmbeddings(
  query: string,
  fileKey: string
): Promise<Array<{ text: string; score: number }>> {
  try {
    if (!process.env.PINECONE_API_KEY) {
      throw new Error("PINECONE_API_KEY is not defined in environment variables");
    }

    const client = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const pineconeIndex = client.index("insights"); 
    const namespace = pineconeIndex.namespace(fileKey);

    const queryEmbedding = await generateEmbedding(query);
    const queryResult = await namespace.query({
      topK: 5,
      vector: queryEmbedding,
      includeMetadata: true,
    });

    return (queryResult.matches || []).map(match => ({
      text: String(match.metadata?.text || ""),
      score: match.score ?? 0,
    }));
  } catch (error) {
    throw error;
  }
}


function normalizeResults(results: Array<{ text: string; score: number }>): Array<{ text: string; score: number }> {
  const maxScore = Math.max(...results.map(r => r.score), 1); // Avoid division by zero
  return results.map(r => ({ ...r, score: r.score / maxScore }));
}

export async function retrieveVectorResults(query: string, namespace: string): Promise<string[]> {
  const vectorResults = await searchEmbeddings(query, namespace);
  const normalizedVectors = normalizeResults(vectorResults);

  const sortedResults = normalizedVectors.sort((a, b) => b.score - a.score);
  const uniqueResults: { [key: string]: number } = {};
  const topResults: string[] = [];

  for (const result of sortedResults) {
    if (!uniqueResults[result.text] && result.text.trim()) { // Skip empty results
      uniqueResults[result.text] = result.score;
      topResults.push(result.text);
      if (topResults.length === 5) break;
    }
  }
  return topResults;
}

export async function retrieveAnswer(query: string, namespace: string): Promise<string> {
  try {
    const refinedQuery = await refineQuery(query);
    // console.log("Refined Query:", refinedQuery);

    const initialResults = await retrieveVectorResults(refinedQuery, namespace);
    // console.log("Initial Retrieval Results:", initialResults);

    // const rankedResults = await rerankResults(refinedQuery, initialResults);
    // console.log("Re-ranked Results:", rankedResults);

    const finalAnswer = await generateFinalAnswer(refinedQuery, initialResults);
    return finalAnswer;
  } catch  {
    return "Unable to generate an answer due to an error.";
  }
}
// import { Pinecone } from "@pinecone-database/pinecone";
// import { generateEmbedding } from "./embedding";
// import { refineQuery, rerankResults, generateFinalAnswer } from "./geminiAPI";
// import dotenv from "dotenv";
// dotenv.config();

// /**
//  * Vector search using Pinecone.
//  */
// export async function searchEmbeddings(
//   query: string,
//   fileKey: string
// ): Promise<Array<{ text: string; score: number }>> {
//   try {
//     const client = new Pinecone({
//       apiKey: process.env.PINECONE_API_KEY!,
//       // environment: process.env.PINECONE_ENVIRONMENT || "us-west1-gcp", // Add environment if required
//     });

//     const pineconeIndex = await client.index("insights");
//     const namespace = pineconeIndex.namespace(fileKey);

//     const queryEmbedding = await generateEmbedding(query);
//     console.log("Query embedding length:", queryEmbedding.length, "for query:", query);

//     const queryResult = await namespace.query({
//       topK: 10, // Increased for debugging
//       vector: queryEmbedding,
//       includeMetadata: true,
//       includeValues: true, // Include vector values for debugging
//     });
//     console.log("Raw Pinecone query result:", queryResult);

//     return (queryResult.matches || []).map((match) => ({
//       text: String(match.metadata?.text || ""),
//       score: match.score ?? 0,
//     }));
//   } catch (error) {
//     console.error("Error querying embeddings:", error);
//     throw error;
//   }
// }

// /**
//  * Normalize scores between 0 and 1.
//  */
// function normalizeResults(results: Array<{ text: string; score: number }>): Array<{ text: string; score: number }> {
//   const scores = results.map((r) => r.score);
//   const maxScore = scores.length > 0 ? Math.max(...scores) : 1; // Avoid division by zero
//   return results.map((r) => ({
//     ...r,
//     score: maxScore > 0 ? r.score / maxScore : r.score, // Handle zero maxScore
//   }));
// }

// /**
//  * Retrieval using vector search only.
//  */
// export async function retrieveVectorResults(query: string, projectURL: string): Promise<string[]> {
//   const vectorResults = await searchEmbeddings(query, projectURL);
//   console.log("Raw vector results:", vectorResults);

//   const normalizedVectors = normalizeResults(vectorResults);
//   console.log("Normalized vector results:", normalizedVectors);

//   // Sort by descending score
//   const sortedResults = normalizedVectors.sort((a, b) => b.score - a.score);

//   // Take the top 5 unique results (based on text)
//   const uniqueResults: { [key: string]: number } = {};
//   const topResults: string[] = [];
//   for (const result of sortedResults) {
//     if (!uniqueResults[result.text] && result.text.trim()) {
//       uniqueResults[result.text] = result.score;
//       topResults.push(result.text);
//       if (topResults.length === 5) break;
//     }
//   }
//   console.log("Top Vector Results:", topResults, "for projectURL:", projectURL);

//   return topResults;
// }

// /**
//  * Full retrieval pipeline.
//  */
// export async function retrieveAnswer(query: string, projectURL: string): Promise<string> {
//   console.log("Initial Query:", query);
//   console.log("Project URL:", projectURL);

//   // Refine the query using Gemini/GPT
//   const refinedQuery = await refineQuery(query);
//   console.log("Refined Query:", refinedQuery);

//   // Retrieve results using vector search
//   const initialResults = await retrieveVectorResults(refinedQuery, projectURL);
//   console.log("Initial Retrieval Results:", initialResults);

//   // Re-rank the results
//   const rankedResults = await rerankResults(refinedQuery, initialResults);
//   console.log("Re-ranked Results:", rankedResults);

//   // Generate the final answer
//   const finalAnswer = await generateFinalAnswer(refinedQuery, rankedResults);
//   console.log("Final Answer Generated:", finalAnswer);
//   return finalAnswer;
// }