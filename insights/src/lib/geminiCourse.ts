import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Initialize Gemini API with safety settings
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

interface OutputFormat {
  [key: string]: string | string[] | OutputFormat;
}

/**
 * Optimized function to generate structured output from Gemini API.
 * @param systemPrompt - Guides the model's behavior (e.g., role, tone).
 * @param userPrompt - Single or array of user prompts for content generation.
 * @param outputFormat - Desired JSON structure for the response.
 * @param defaultCategory - Fallback value for unrecognized fields (optional).
 * @param outputValueOnly - Returns only values if true, stripping keys.
 * @param modelName - Gemini model to use (default: "gemini-1.5-flash").
 * @param temperature - Randomness control (0-1, default: 0.7).
 * @param maxRetries - Number of retry attempts (default: 3).
 * @param verbose - Logs detailed debugging info if true.
 * @returns Structured output matching the provided format.
 * @throws Error on fatal failures (e.g., API key missing).
 */
export async function strict_output(
  systemPrompt: string,
  userPrompt: string | string[],
  outputFormat: OutputFormat,
  defaultCategory: string = "",
  outputValueOnly: boolean = false,
  modelName: string = "gemini-1.5-flash",
  temperature: number = 0.7,
  maxRetries: number = 3,
  verbose: boolean = false
): Promise<any> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  const model = genAI.getGenerativeModel({ model: modelName });

  const isListInput = Array.isArray(userPrompt);
  const isListOutput = /\[.*?\]/.test(JSON.stringify(outputFormat));
  const hasDynamicElements = /<.*?>/.test(JSON.stringify(outputFormat));

  let errorMsg = "";

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      let outputPrompt = `\nOutput ${
        isListOutput ? "an array of objects in" : ""
      } JSON format: ${JSON.stringify(outputFormat)}. Do not include markdown or code block indicators.`;

      if (isListOutput) {
        outputPrompt += `\nFor list fields, select the best matching element if multiple options exist.`;
      }
      if (hasDynamicElements) {
        outputPrompt += `\nReplace text in < > with generated content (e.g., '<location>' → 'garden').`;
      }
      if (isListInput) {
        outputPrompt += `\nGenerate an array of JSON objects, one per input prompt.`;
      }

      const generationConfig = {
        temperature: Math.min(Math.max(temperature, 0), 1), // Clamp between 0 and 1
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048, // Increase for detailed outlines
      };

      const fullPrompt = `${systemPrompt}${outputPrompt}${errorMsg}\n\n${
        isListInput ? userPrompt.join("\n") : userPrompt
      }`;

      if (verbose) {
        console.log("Attempt:", attempt + 1);
        console.log("Full Prompt:", fullPrompt);
      }

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
        generationConfig,
        safetySettings,
      });

      const responseText = result.response.text().trim();
      if (!responseText) {
        throw new Error("Empty response from Gemini API");
      }

      // Clean response
      const cleanResponse = responseText.replace(/```json\n?|\n?```/g, "");
      let output: any;

      try {
        output = JSON.parse(cleanResponse);
      } catch (parseError) {
        throw new Error(`Failed to parse JSON: ${parseError instanceof Error ? parseError.message : "Unknown error"} - Response: ${cleanResponse}`);
      }

      if (isListInput && !Array.isArray(output)) {
        throw new Error("Expected array output for multiple prompts");
      }

      const normalizedOutput = isListInput ? output : [output];

      // Validate and normalize output
      for (let i = 0; i < normalizedOutput.length; i++) {
        const item = normalizedOutput[i];
        for (const key in outputFormat) {
          if (/<.*?>/.test(key)) continue;

          if (!(key in item)) {
            throw new Error(`Missing key "${key}" in output`);
          }

          const formatValue = outputFormat[key];
          if (Array.isArray(formatValue)) {
            const choices = formatValue as string[];
            if (Array.isArray(item[key])) {
              item[key] = item[key][0]; // Take first element if array
            }
            if (!choices.includes(item[key]) && defaultCategory) {
              item[key] = defaultCategory;
            }
            if (typeof item[key] === "string" && item[key].includes(":")) {
              item[key] = item[key].split(":")[0].trim();
            }
          }
        }

        if (outputValueOnly) {
          normalizedOutput[i] = Object.values(item);
          if (normalizedOutput[i].length === 1) {
            normalizedOutput[i] = normalizedOutput[i][0];
          }
        }
      }

      return isListInput ? normalizedOutput : normalizedOutput[0];
    } catch (error: any) {
      errorMsg = `\n\nPrevious error: ${error.message}`;
      console.error(`Attempt ${attempt + 1} failed:`, verbose ? error : error.message);

      if (error.message.includes("429")) {
        console.warn("Rate limit hit, retrying after delay...");
        await delay(2000 * (attempt + 1)); // Exponential backoff
      }

      if (attempt === maxRetries - 1) {
        console.error("Max retries reached, returning empty result");
        return isListInput ? [] : {};
      }
    }
  }

  return isListInput ? [] : {}; // Fallback return
}

/**
 * Process prompts sequentially for stable output.
 * @param systemPrompt - System instructions.
 * @param userPrompts - Array of user prompts.
 * @param outputFormat - Desired JSON structure.
 * @param verbose - Enable detailed logging.
 */
export async function processPromptsSequentially(
  systemPrompt: string,
  userPrompts: string[],
  outputFormat: OutputFormat,
  verbose: boolean = false
): Promise<any[]> {
  const results: any[] = [];
  for (const prompt of userPrompts) {
    const result = await strict_output(
      systemPrompt,
      prompt,
      outputFormat,
      "",
      false,
      "gemini-1.5-flash",
      0.7,
      3,
      verbose
    );
    results.push(result);
  }
  return results;
}

/**
 * Process prompts in batches for performance.
 * @param systemPrompt - System instructions.
 * @param userPrompts - Array of user prompts.
 * @param outputFormat - Desired JSON structure.
 * @param batchSize - Number of prompts per batch.
 * @param verbose - Enable detailed logging.
 */
export async function processPromptsInBatches(
  systemPrompt: string,
  userPrompts: string[],
  outputFormat: OutputFormat,
  batchSize: number = 3,
  verbose: boolean = false
): Promise<any[]> {
  const results: any[] = [];
  for (let i = 0; i < userPrompts.length; i += batchSize) {
    const batch = userPrompts.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(prompt =>
        strict_output(
          systemPrompt,
          prompt,
          outputFormat,
          "",
          false,
          "gemini-1.5-flash",
          0.7,
          3,
          verbose
        )
      )
    );
    results.push(...batchResults);
  }
  return results;
}