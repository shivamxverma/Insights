// app/api/getTranscript/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getTranscript } from "@/lib/youtube";

const fetchVideoDetails = async (videoId: string) => {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return null;

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`
  );
  const data = await res.json();
  return data.items?.[0]?.snippet || null;
};

const fetchPlaylistItems = async (playlistId: string, limit: number = 50) => {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return [];

  let items: any[] = [];
  let nextPageToken = "";

  do {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50${
      nextPageToken ? `&pageToken=${nextPageToken}` : ""
    }&key=${apiKey}`;

    const res = await fetch(url);
    const data = await res.json();
    if (data.items) items = items.concat(data.items);
    nextPageToken = data.nextPageToken;
  } while (nextPageToken && items.length < limit);

  return items.slice(0, limit);
};

const truncateTo300Words = (text: string) => {
  const words = text.split(/\s+/).slice(0, 300);
  return words.join(" ") + (words.length < text.split(/\s+/).length ? "..." : "");
};

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const moduleId = searchParams.get("moduleId");
  const videoId = searchParams.get("videoId");

  if (!moduleId || !videoId) {
    return NextResponse.json({ error: "moduleId and videoId are required" }, { status: 400 });
  }

  try {
    const video = await prisma.video.findFirst({
      where: { moduleId, videoId },
    });

    let transcript: { text: string; start: number; duration: number }[];
    let generatedSummary: string | null = null;

    if (video?.summary) {
      transcript = JSON.parse(video.summary);
      if (!Array.isArray(transcript)) {
        console.error("Invalid transcript format in database:", video.summary);
        throw new Error("Invalid transcript format in database");
      }
      transcript = transcript.map((seg) => ({
        text: seg.text || "",
        start: typeof seg.start === "number" ? seg.start : 0,
        duration: typeof seg.duration === "number" ? seg.duration : 0,
      }));
      generatedSummary = video.generatedSummary; // Retrieve stored summary
    } else {
      transcript = await getTranscript(videoId);
      await prisma.video.create({
        data: {
          name: (await fetchVideoDetails(videoId))?.title || "Untitled",
          url: `https://www.youtube.com/watch?v=${videoId}`,
          videoId,
          moduleId,
          summary: JSON.stringify(transcript),
        },
      });
    }

    console.log("Fetched transcript:", transcript);
    console.log("Fetched generatedSummary:", generatedSummary);
    return NextResponse.json({ transcript, generatedSummary }, { status: 200 });
  } catch (error) {
    console.error("Error fetching transcript:", error);
    return NextResponse.json({ error: "Failed to fetch transcript" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, videoId, playlistId, moduleId, action, newModuleName } = await req.json();

    if (!userId || !action) {
      return NextResponse.json({ error: "userId and action are required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.credits <= 0) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 403 });
    }

    let targetModule;
    if (action === "new") {
      targetModule = await prisma.videoModule.create({
        data: { name: newModuleName || `New Module ${new Date().toLocaleDateString()}`, userId },
      });
    } else if (action === "existing") {
      if (!moduleId) {
        return NextResponse.json({ error: "moduleId is required for existing module" }, { status: 400 });
      }
      targetModule = await prisma.videoModule.findUnique({ where: { id: moduleId } });
      if (!targetModule || targetModule.userId !== userId) {
        return NextResponse.json({ error: "Invalid module" }, { status: 403 });
      }
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    if (!targetModule) {
      return NextResponse.json({ error: "Module creation failed" }, { status: 500 });
    }

    if (videoId && !playlistId) {
      const details = await fetchVideoDetails(videoId);
      if (!details) {
        return NextResponse.json({ error: "Video not found" }, { status: 404 });
      }

      const transcript = await getTranscript(videoId);
      const summary = JSON.stringify(transcript);

      const existingVideo = await prisma.video.findFirst({
        where: { moduleId: targetModule.id, videoId: videoId },
      });

      if (existingVideo) {
        await prisma.video.update({
          where: { id: existingVideo.id },
          data: { summary },
        });
      } else {
        await prisma.video.create({
          data: {
            name: details.title,
            url: `https://www.youtube.com/watch?v=${videoId}`,
            videoId,
            summary,
            moduleId: targetModule.id,
          },
        });
      }
    } else if (playlistId) {
      const playlistItems = await fetchPlaylistItems(playlistId);
      if (!playlistItems.length) {
        return NextResponse.json({ error: "No videos in playlist" }, { status: 404 });
      }

      const playlistVideoIds = playlistItems.map((item: any) => item.snippet.resourceId.videoId);
      const existingVideos = await prisma.video.findMany({
        where: { moduleId: targetModule.id, videoId: { in: playlistVideoIds } },
        select: { videoId: true },
      });

      const existingVideoIds = existingVideos.map((v) => v.videoId);
      const newVideosData = await Promise.all(
        playlistItems
          .filter((item: any) => !existingVideoIds.includes(item.snippet.resourceId.videoId))
          .map(async (item: any) => {
            const transcript = await getTranscript(item.snippet.resourceId.videoId);
            const summary = JSON.stringify(transcript);
            return {
              name: item.snippet.title,
              url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
              videoId: item.snippet.resourceId.videoId,
              summary,
              moduleId: targetModule.id,
            };
          })
      );

      if (newVideosData.length > 0) {
        await prisma.video.createMany({
          data: newVideosData,
          skipDuplicates: true,
        });
      }
    } else {
      return NextResponse.json({ error: "Either videoId or playlistId is required" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { credits: user.credits - 1 },
    });

    return NextResponse.json({ module: targetModule }, { status: 201 });
  } catch (error) {
    console.error("Error in POST request:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
// // app/api/getTranscript/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/db";
// import { getTranscript } from "@/lib/youtube";

// const fetchVideoDetails = async (videoId: string) => {
//   const apiKey = process.env.YOUTUBE_API_KEY;
//   if (!apiKey) return null;

//   const res = await fetch(
//     `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`
//   );
//   const data = await res.json();
//   return data.items?.[0]?.snippet || null;
// };

// const fetchPlaylistItems = async (playlistId: string, limit: number = 50) => {
//   const apiKey = process.env.YOUTUBE_API_KEY;
//   if (!apiKey) return [];

//   let items: any[] = [];
//   let nextPageToken = "";

//   do {
//     const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50${
//       nextPageToken ? `&pageToken=${nextPageToken}` : ""
//     }&key=${apiKey}`;

//     const res = await fetch(url);
//     const data = await res.json();
//     if (data.items) items = items.concat(data.items);
//     nextPageToken = data.nextPageToken;
//   } while (nextPageToken && items.length < limit);

//   return items.slice(0, limit);
// };

// const truncateTo300Words = (text: string) => {
//   const words = text.split(/\s+/).slice(0, 300);
//   return words.join(" ") + (words.length < text.split(/\s+/).length ? "..." : "");
// };

// export async function GET(req: NextRequest) {
//   const searchParams = req.nextUrl.searchParams;
//   const moduleId = searchParams.get("moduleId");
//   const videoId = searchParams.get("videoId");

//   if (!moduleId || !videoId) {
//     return NextResponse.json({ error: "moduleId and videoId are required" }, { status: 400 });
//   }

//   try {
//     // Check if the transcript is already stored in the database
//     const video = await prisma.video.findFirst({
//       where: { moduleId, videoId },
//     });

//     let transcript: { text: string; start: number; duration: number }[];
//     if (video?.summary) {
//       // Parse the stored JSON string into an array
//       transcript = JSON.parse(video.summary);
//       if (!Array.isArray(transcript)) {
//         console.error("Invalid transcript format in database:", video.summary);
//         throw new Error("Invalid transcript format in database");
//       }
//       // Validate and clean the parsed data
//       transcript = transcript.map((seg) => ({
//         text: seg.text || "",
//         start: typeof seg.start === "number" ? seg.start : 0,
//         duration: typeof seg.duration === "number" ? seg.duration : 0,
//       }));
//     } else {
//       // Fetch fresh transcript if not in database
//       transcript = await getTranscript(videoId);
//       // Save it to the database for future use
//       await prisma.video.update({
//         where: { id: video?.id || (await prisma.video.create({ data: { videoId, moduleId, url: `https://www.youtube.com/watch?v=${videoId}`, summary: JSON.stringify(transcript) } })).id },
//         data: { summary: JSON.stringify(transcript) },
//       });
//     }

//     console.log("Fetched transcript:", transcript); // Debug log
//     return NextResponse.json({ transcript }, { status: 200 });
//   } catch (error) {
//     console.error("Error fetching transcript:", error);
//     return NextResponse.json({ error: "Failed to fetch transcript" }, { status: 500 });
//   }
// }

// export async function POST(req: NextRequest) {
//   try {
//     const { userId, videoId, playlistId, moduleId, action, newModuleName } = await req.json();

//     if (!userId || !action) {
//       return NextResponse.json({ error: "userId and action are required" }, { status: 400 });
//     }

//     const user = await prisma.user.findUnique({ where: { id: userId } });
//     if (!user || user.credits <= 0) {
//       return NextResponse.json({ error: "Insufficient credits" }, { status: 403 });
//     }

//     let targetModule;
//     if (action === "new") {
//       targetModule = await prisma.videoModule.create({
//         data: { name: newModuleName || `New Module ${new Date().toLocaleDateString()}`, userId },
//       });
//     } else if (action === "existing") {
//       if (!moduleId) {
//         return NextResponse.json({ error: "moduleId is required for existing module" }, { status: 400 });
//       }
//       targetModule = await prisma.videoModule.findUnique({ where: { id: moduleId } });
//       if (!targetModule || targetModule.userId !== userId) {
//         return NextResponse.json({ error: "Invalid module" }, { status: 403 });
//       }
//     } else {
//       return NextResponse.json({ error: "Invalid action" }, { status: 400 });
//     }

//     if (!targetModule) {
//       return NextResponse.json({ error: "Module creation failed" }, { status: 500 });
//     }

//     if (videoId && !playlistId) {
//       const details = await fetchVideoDetails(videoId);
//       if (!details) {
//         return NextResponse.json({ error: "Video not found" }, { status: 404 });
//       }

//       const transcript = await getTranscript(videoId);
//       const summary = JSON.stringify(transcript);

//       const existingVideo = await prisma.video.findFirst({
//         where: { moduleId: targetModule.id, videoId: videoId },
//       });

//       if (existingVideo) {
//         await prisma.video.update({
//           where: { id: existingVideo.id },
//           data: { moduleId: targetModule.id, summary },
//         });
//       } else {
//         await prisma.video.create({
//           data: {
//             name: details.title,
//             url: `https://www.youtube.com/watch?v=${videoId}`,
//             videoId,
//             summary,
//             moduleId: targetModule.id,
//           },
//         });
//       }
//     } else if (playlistId) {
//       const playlistItems = await fetchPlaylistItems(playlistId);
//       if (!playlistItems.length) {
//         return NextResponse.json({ error: "No videos in playlist" }, { status: 404 });
//       }

//       const playlistVideoIds = playlistItems.map((item: any) => item.snippet.resourceId.videoId);
//       const existingVideos = await prisma.video.findMany({
//         where: { moduleId: targetModule.id, videoId: { in: playlistVideoIds } },
//         select: { videoId: true },
//       });

//       const existingVideoIds = existingVideos.map((v) => v.videoId);
//       const newVideosData = await Promise.all(
//         playlistItems
//           .filter((item: any) => !existingVideoIds.includes(item.snippet.resourceId.videoId))
//           .map(async (item: any) => {
//             const transcript = await getTranscript(item.snippet.resourceId.videoId);
//             const summary = JSON.stringify(transcript);
//             return {
//               name: item.snippet.title,
//               url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
//               videoId: item.snippet.resourceId.videoId,
//               summary,
//               moduleId: targetModule.id,
//             };
//           })
//       );

//       if (newVideosData.length > 0) {
//         await prisma.video.createMany({
//           data: newVideosData,
//           skipDuplicates: true,
//         });
//       }
//     } else {
//       return NextResponse.json({ error: "Either videoId or playlistId is required" }, { status: 400 });
//     }

//     await prisma.user.update({
//       where: { id: userId },
//       data: { credits: user.credits - 1 },
//     });

//     return NextResponse.json({ module: targetModule }, { status: 201 });
//   } catch (error) {
//     console.error("Error in POST request:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }