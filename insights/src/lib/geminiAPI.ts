import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 

export async function refineQuery(query: string): Promise<string> {
  const prompt = `Given the query "${query}", rephrase it into a concise, clear, and specific question or statement optimized for accurate retrieval of relevant information. Avoid adding unnecessary words, and focus on improving searchability and clarity. Output only the rephrased query as plain text, with no additional commentary or formatting.`;
  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch {
    return query;
  }
}

export async function rerankResults(query: string, results: string[]): Promise<string[]> {
  const prompt = `Rank these documents by relevance to "${query}":\n${JSON.stringify(results, null, 2)}\nOutput only a JSON array of reordered texts.`;
  try {
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch{
    return results; 
  }
}

export async function generateFinalAnswer(query: string, results: string[]): Promise<string> {
  const prompt = `
    Summarize key points from these documents to answer "${query}" in the following format:
    - Main topics as standalone headings (no bolding or bullets).
    - Details listed below each heading as plain text lines (no nesting or bullets).
    - Keep it concise and structured like this example:
      Compliance with Codes and Standards
      Adheres to IEEE Std. 730, UL listings, UL508A, and NEMA/IEEE standards.
      Ensures all components meet safety and performance benchmarks.
      Deliverables
      Includes Factory and Site Acceptance Test procedures.
      Provides as-built drawings and manuals.
    Output only the formatted answer as plain text.
    Documents:\n${JSON.stringify(results, null, 2)}
  `;
  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch  {
    return "Unable to generate an answer.";
  }
}
// import { GoogleGenerativeAI } from '@google/generative-ai';
// import dotenv from 'dotenv';
// dotenv.config();

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
// const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// /**
//  * Refine the user's query for better retrieval.
//  * The prompt instructs the model to rephrase the query to maximize clarity and search relevance.
//  */
// export async function refineQuery(query: string): Promise<string> {
//   const prompt = `
// User Query: "${query}"
  
// Please rephrase the above query to improve its clarity and relevance for search. 
// Output only the revised query text without any additional commentary.
// `;
//   try {
//     const response = await model.generateContent(prompt);
//     const refined = response.response.text();
//     console.log("Refined query:", refined);
//     return refined;
//   } catch (error) {
//     console.error("Error refining query:", error);
//     return query;
//   }
// }

// /**
//  * Re-rank retrieval results based on the user query.
//  * The prompt instructs the model to reorder the provided documents by relevance,
//  * returning a JSON array of the document texts, sorted from most to least relevant.
//  */
// export async function rerankResults(query: string, results: string[]): Promise<string[]> {
//   const prompt = `
// User Query: "${query}"

// Retrieved Documents (in no particular order):
// ${JSON.stringify(results, null, 2)}

// Please rank these documents in order of relevance to the query (most relevant first). 
// Output only a JSON array of the reordered document texts without any extra commentary.
// `;
//   try {
//     const response = await model.generateContent(prompt);
//     const ranked = JSON.parse(response.response.text());
//     console.log("Ranked results:", ranked);
//     return ranked;
//   } catch (error) {
//     console.error("Error re-ranking results:", error);
//     return results;
//   }
// }

// /**
//  * Generate a final answer by summarizing the key points from the results.
//  * The prompt instructs the model to synthesize a concise and informative answer,
//  * integrating the important details from the top retrieval results to address the query.
//  */
// export async function generateFinalAnswer(query: string, results: string[]): Promise<string> {
//   const prompt = `
// You are a knowledgeable retrieval assistant.

// User Query: "${query}"

// Top Retrieval Results:
// ${JSON.stringify(results, null, 2)}

// Based on the documents above, generate a clear, concise, and informative final answer that summarizes the key points and directly addresses the query.
// Provide your answer as plain text .
// `;
//   try {
//     const response = await model.generateContent(prompt);
//     const finalAnswer = response.response.text();
//     console.log("Final answer generated:", finalAnswer);
//     return finalAnswer;
//   } catch (error) {
//     console.error("Error generating final answer:", error);
//     return "";
//   }
// }
