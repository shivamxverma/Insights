import { AdvancedScraper } from "./scraping"
import { processText } from "./chunking"; 
import { uploadToPinecone } from "./pineconedb"; 
import md5 from "md5";
import dotenv from "dotenv";

dotenv.config();

export async function scrapedContent(url: string): Promise<string | undefined> {
  const scraper = new AdvancedScraper();

  try {
    const result = await scraper.scrape(url);
    if (!result || !result.content) {
      console.error(`Failed to scrape content from ${url}`);
      return;
    }

    console.log(`Scraped content length from ${url}:`, result.content.length);

    // const { chunks, embeddings } = await processText(result.content);
    // if (!chunks.length || !embeddings.length) {
    //   console.error(`No chunks or embeddings generated for ${url}`);
    //   return result.content;
    // }

    // console.log(`Generated ${chunks.length} chunks for ${url}`);

    // const vectors = chunks.map((chunk, index) => ({
    //   id: md5(`${url}-${chunk.metadata.startIndex}`), // Unique ID per chunk
    //   values: embeddings[index],
    //   metadata: {
    //     text: chunk.text,
    //     startIndex: chunk.metadata.startIndex,
    //     endIndex: chunk.metadata.endIndex,
    //     title: result.metadata.title,
    //     description: result.metadata.description,
    //     source: result.metadata.source,
    //     url: result.metadata.url,
    //     timestamp: result.metadata.timestamp,
    //   },
    // }));

    // const namespace = new URL(url).hostname;
    // // await uploadToPinecone(vectors, url);
    // console.log(`Uploaded ${vectors.length} vectors to Pinecone for ${namespace}`);

    return result.content;
  } catch (error) {
    console.error(`Error processing ${url}:`, error);
  } finally {
    await scraper.close();
  }
}

if (require.main === module) {
  const url = process.argv[2];
  if (!url) {
    console.error("Please provide a URL as an argument.");
    process.exit(1);
  }
  scrapedContent(url)
    .then((content) => {
      if (content) console.log("Scraping and processing completed successfully.");
    })
    .catch((err) => console.error("Main process failed:", err));
}

