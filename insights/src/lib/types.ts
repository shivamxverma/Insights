// src/types.ts
export interface Video {
    videoId: string;
    name: string;
  }
  
  export interface Module {
    id: string;
    name: string; // Strictly a string
    videos: Video[];
  }