import axios from "axios";
import * as cheerio from "cheerio";
import { chromium, Browser, Page } from "playwright";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import { setTimeout } from "timers/promises";
import dotenv from "dotenv";

dotenv.config();

export interface ScrapingResult {
  content: string;
  metadata: {
    title: string;
    description: string;
    url: string;
    timestamp: string;
    source: "cheerio" | "playwright" | "readability" | "combined";
  };
}

export class AdvancedScraper {
  private browser: Browser | null = null;
  private concurrentLimit = 3;
  private activeScrapes = 0;
  private userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
  ];
  private static requestCount = 0;
  private static readonly MAX_REQUESTS_PER_MINUTE = 60;

  constructor(private customSelectors?: string[]) {
    this.initBrowser();
    setInterval(() => {
      AdvancedScraper.requestCount = 0;
    }, 60 * 1000);
  }

  private async initBrowser() {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
      });
    }
  }

  private async getPage(): Promise<Page> {
    await this.initBrowser();
    while (this.activeScrapes >= this.concurrentLimit) {
      await setTimeout(100);
    }
    this.activeScrapes++;
    const page = await this.browser!.newPage();
    const randomUserAgent = this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
    await page.setExtraHTTPHeaders({ "User-Agent": randomUserAgent });
    return page;
  }

  private async releasePage() {
    this.activeScrapes--;
  }

  private cleanContent(content: string): string {
    return content
      .replace(/\r\n/g, "\n")
      .replace(/\s+/g, " ")
      .replace(/\n\s*\n/g, "\n\n") // Preserve paragraph breaks
      .trim();
  }

  private async scrapeWithCheerio(url: string): Promise<ScrapingResult | null> {
    try {
      const randomUserAgent = this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
      const { data } = await axios.get(url, {
        timeout: 15000,
        headers: { "User-Agent": randomUserAgent },
      });
      const $ = cheerio.load(data);
      $("script, style, nav, footer, header, aside, form, iframe, noscript, svg, .ad, .advertisement, .social-share").remove();

      const selectors = this.customSelectors || [
        "article",
        '[role="main"]',
        "main",
        ".main-content",
        "#main-content",
        ".post-content",
        ".article-content",
        ".content",
      ];
      let content = "";
      for (const selector of selectors) {
        const element = $(selector);
        if (element.length) {
          content = element.text();
          break;
        }
      }
      if (!content || content.length < 500) {
        content = $("body").text();
      }
      content = this.cleanContent(content);
      if (content.length < 500) {
        const readabilityResult = this.scrapeWithReadability(data, url);
        if (readabilityResult) return readabilityResult;
      }
      return {
        content,
        metadata: {
          title: $("title").text() || "Untitled",
          description: $("meta[name='description']").attr("content") || "",
          url,
          timestamp: new Date().toISOString(),
          source: "cheerio",
        },
      };
    } catch (error) {
      console.error(`Cheerio scraping failed for ${url}:`, error);
      return null;
    }
  }

  private scrapeWithReadability(html: string, url: string): ScrapingResult | null {
    try {
      const dom = new JSDOM(html, { url });
      const reader = new Readability(dom.window.document);
      const article = reader.parse();
      if (article && article.textContent && article.textContent.length > 0) {
        return {
          content: this.cleanContent(article.textContent),
          metadata: {
            title: article.title || "Untitled",
            description: article.excerpt || "",
            url,
            timestamp: new Date().toISOString(),
            source: "readability",
          },
        };
      }
    } catch (error) {
      console.error(`Readability extraction failed for ${url}:`, error);
    }
    return null;
  }

  private async scrapeWithPlaywright(url: string): Promise<ScrapingResult | null> {
    const page = await this.getPage();
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
      await this.autoScroll(page);

      interface PageEvaluationResult {
        content: string;
        title: string;
        description: string;
      }

      const result: PageEvaluationResult = await page.evaluate((customSelectors: string[] | undefined): PageEvaluationResult => {
        const removeSelectors = [
          "script", "style", "nav", "footer", "header", "aside", "form", "iframe", ".ad", ".advertisement", ".social-share",
        ];
        removeSelectors.forEach((selector) => {
          document.querySelectorAll(selector).forEach((el) => el.remove());
        });
        const selectors = customSelectors || [
          "article",
          '[role="main"]',
          "main",
          ".main-content",
          "#main-content",
          ".post-content",
          ".article-content",
          ".content",
        ];
        let content = "";
        for (const selector of selectors) {
          const element = document.querySelector(selector);
          if (element) {
            content = element.textContent || "";
            break;
          }
        }
        if (!content) {
          content = document.body.textContent || "";
        }
        return {
          content,
          title: document.title,
          description: document.querySelector('meta[name="description"]')?.getAttribute("content") || "",
        };
      }, this.customSelectors);

      return {
        content: this.cleanContent(result.content),
        metadata: {
          title: result.title || "Untitled",
          description: result.description,
          url,
          timestamp: new Date().toISOString(),
          source: "playwright",
        },
      };
    } catch (error) {
      console.error(`Playwright scraping failed for ${url}:`, error);
      return null;
    } finally {
      await page.close();
      this.releasePage();
    }
  }

  private async autoScroll(page: Page) {
    await page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let totalHeight = 0;
        const distance = 200;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= scrollHeight - window.innerHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 150);
      });
    });
  }

  async scrape(url: string): Promise<ScrapingResult | null> {
    if (AdvancedScraper.requestCount >= AdvancedScraper.MAX_REQUESTS_PER_MINUTE) {
      throw new Error("Rate limit exceeded");
    }
    AdvancedScraper.requestCount++;

    const cheerioResult = await this.scrapeWithCheerio(url);
    let finalResult: ScrapingResult | null = null;

    if (cheerioResult && cheerioResult.content.length > 1000) {
      finalResult = cheerioResult;
    } else {
      const playwrightResult = await this.scrapeWithPlaywright(url);
      if (cheerioResult && playwrightResult) {
        const combinedContent = new Set([
          ...cheerioResult.content.split("\n"),
          ...playwrightResult.content.split("\n"),
        ]);
        finalResult = {
          content: Array.from(combinedContent).join("\n\n"),
          metadata: {
            title: cheerioResult.metadata.title || playwrightResult.metadata.title,
            description: cheerioResult.metadata.description || playwrightResult.metadata.description,
            url,
            timestamp: new Date().toISOString(),
            source: "combined",
          },
        };
      } else {
        finalResult = playwrightResult || cheerioResult;
      }
    }

    console.log(`Scraped content length for ${url}:`, finalResult?.content.length);
    return finalResult;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}