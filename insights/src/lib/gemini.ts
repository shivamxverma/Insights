// src/lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Please provide your Gemini API key in the environment variable GEMINI_API_KEY");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Function to rephrase transcript using Gemini API
export async function rephraseTranscript(transcriptText: string): Promise<string> {
  const prompt = `
Rephrase the following transcript to improve clarity and conciseness while maintaining its core meaning. Structure the output as a list of timestamped entries in the format:
- [MM:SS]: Rephrased text

Transcript: "${transcriptText}"

Output only the rephrased transcript entries without additional commentary.
`;

  try {
    const response = await model.generateContent(prompt);
    return response.response.text();
  } catch (error) {
    console.error("Error rephrasing transcript:", error);
    return transcriptText; // Fallback to original
  }
}

// Function to generate summary using Gemini API
export async function generateSummary(transcript: string): Promise<string> {
  const prompt = `
Summarize the following transcript into a concise format with a main summary, key highlights, and insights. Structure the output as follows:
- **Summary**: A brief paragraph summarizing the main points (100-150 words).
- **Highlights**: 5-7 bullet points capturing key moments or themes, each starting with an emoji (e.g., 🚀, 🏃‍♂️).
- **Insights**: 3-5 bullet points providing deeper reflections or lessons, each starting with an emoji (e.g., 🧠, 🔨).

Transcript: "${transcript}"

Output only the summarized content in the specified structure without additional commentary.
`;

  try {
    const response = await model.generateContent(prompt);
    return response.response.text();
  } catch (error) {
    console.error("Error generating summary:", error);
    return `
- **Summary**: Unable to generate summary due to an error.
- **Highlights**:
  - ⚠️ Error occurred while processing the transcript.
- **Insights**:
  - 🛠️ Please ensure the Gemini API key is correctly configured.
`;
  }
}