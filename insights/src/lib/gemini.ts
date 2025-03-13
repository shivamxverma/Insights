import 'dotenv/config';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");
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

// Function to generate MCQ questions using Gemini API
export async function generateQuestions(
  transcript: string,
  videoTitle: string,
  isHindi: boolean = false
): Promise<{ question: string; answer: string; options: string[] }[]> {
  const languageInstruction = isHindi
    ? "The transcript is in Hindi. Generate questions and options in Hindi, ensuring answers and options are max 15 words each."
    : "The transcript is in English. Generate questions and options in English, ensuring answers and options are max 15 words each.";
  
  const prompt = `
You are a helpful AI that generates hard multiple-choice questions (MCQs) based on the given transcript and video title. Generate 5 unique MCQs. Each question must:
- Be challenging and derived from the transcript content.
- Have one correct answer with a maximum length of 15 words.
- Include exactly 3 plausible but incorrect distractor options (also max 15 words each), ensuring they are distinct from the correct answer.
- ${languageInstruction}
- Return the questions in a structured JSON array format without code blocks.

Transcript: "${transcript}"
Video Title: "${videoTitle}"

Output only a JSON array of objects, where each object has:
- "question": The MCQ question (string)
- "answer": The correct answer (string, max 15 words)
- "options": An array of exactly 4 strings [answer, distractor1, distractor2, distractor3] with max 15 words each, shuffled randomly
`;

  try {
    const response = await model.generateContent(prompt);
    let text = response.response.text();

    // Remove code block markers if present (though prompt specifies no blocks)
    text = text.replace(/```json\n|\n```/g, "").trim();

    // Log raw response for debugging
    console.log("Raw Gemini Response:", text);

    // Parse the JSON response
    const questions = JSON.parse(text) as { question: string; answer: string; options: string[] }[];
    
    // Basic validation to ensure each question has the correct answer in its options
    return questions.map(q => {
      // Make sure the answer is included in the options
      if (!q.options.includes(q.answer)) {
        q.options[0] = q.answer; // Replace first option with the answer if missing
      }
      return q;
    });
    
  } catch (error) {
    console.error("Error generating questions:", error);
    // Return fallback questions in the detected language
    return [
      {
        question: isHindi ? "प्रश्न उत्पन्न करने में त्रुटि हुई।" : "Error occurred while generating a question.",
        answer: isHindi ? "कृपया बाद में पुनः प्रयास करें।" : "Please try again later.",
        options: [
          isHindi ? "कृपया बाद में पुनः प्रयास करें।" : "Please try again later.",
          isHindi ? "विकल्प 1" : "Option 1",
          isHindi ? "विकल्प 2" : "Option 2",
          isHindi ? "विकल्प 3" : "Option 3",
        ].sort(() => Math.random() - 0.5),
      },
    ];
  }
}

