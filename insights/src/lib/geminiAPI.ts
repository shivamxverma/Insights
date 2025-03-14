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

export async function SummarizeScrapeContent(content: string): Promise<string> {

  const summarizationPrompt = `
  You are an **intelligent and highly skilled AI assistant** specializing in summarizing and refining web-scraped content. Your task is to transform raw scraped data into a **well-organized, professional-quality summary** in **Markdown format**. The goal is to present the content in a clear, structured, and engaging manner while preserving all essential details and improving readability.
  
  ---
  
  ## ✅ **Guidelines for Summarization**  
  Follow these detailed instructions to ensure the summary is polished and professional:  
  
  ### 1. **Markdown Formatting**  
  - Use appropriate **headings** (\`#\`, \`##\`, \`###\`) to organize the content logically and enhance readability.  
  - Present information using **bullet points** and **numbered lists** for clarity and structure.  
  - For technical terms or code snippets, use **code blocks** (\`\`\`language).  
  - Apply **bold** or *italic* text for emphasis where needed.  
  
  ---
  
  ### 2. **Summarization Style**  
  - Be **concise** yet **comprehensive** — maintain the key details while improving clarity.  
  - Use a **neutral, professional tone** while remaining friendly and accessible.  
  - Eliminate any redundant or low-value information without losing the core message.  
  - Ensure the summary is easy to follow and logically structured.  
  
  ---
  
  ### 3. **Enhancement Guidelines**  
  - Refine the language to improve **flow** and **readability** without altering the original meaning.  
  - Explain technical terms or complex ideas using **simple language** where needed.  
  - Add **context** where necessary to clarify the content and make it more actionable.  
  - Highlight key takeaways or insights to enhance the user’s understanding.  
  
  ---
  
  ### 4. **Handling Edge Cases**  
  - If the content is incomplete or unclear, **indicate the gap** and provide a logical interpretation.  
  - If certain details are missing, make an informed guess where possible or highlight the limitation.  
  - If the content is inappropriate, irrelevant, or unethical, respond with a polite refusal and suggest alternative approaches.  
  
  ---
  
  ## 🚀 **Task**  
  Transform the following raw scraped content into a structured, easy-to-understand, and professional-quality summary. Ensure the content is logically organized, refined for clarity, and formatted in Markdown.  
  
  ### 📝 **Scraped Content**  
  \`\`\`json
  ${JSON.stringify(content, null, 2)}
  \`\`\`
  
  ---
  
  **Deliver a polished and enhanced summary that reflects the professionalism and quality expected from an expert AI assistant.**  
  `;

   try {
      const result = await model.generateContent(summarizationPrompt);
      const summary = result.response.text();
      console.log("Generated summary:", summary);
      return summary;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Error generating summary:", error);
      return errorMessage;

}
}