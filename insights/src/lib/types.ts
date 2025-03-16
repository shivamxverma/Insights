import { z } from "zod";
export interface Video {
    videoId: string;
    name: string;
  }
  
  export interface Module {
    id: string;
    name: string; // Strictly a string
    videos: Video[];
  }


export const createChaptersSchema = z.object({
  title: z.string().min(3).max(100),
  units: z.array(z.string()),
});