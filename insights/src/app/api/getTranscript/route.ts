import { prisma } from '@/lib/db'
import { NextRequest } from 'next/server';

interface TranscriptResponse {
    transcript: string;
}

interface ErrorResponse {
    error: string;
}

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const moduleId = url.searchParams.get('moduleId');
    const videoId = url.searchParams.get('videoId');
    
    try {
        const result = await prisma.video.findFirst({
            where: {
                moduleId: moduleId,
                videoId: videoId
            }
        });
        
        if (result && result.summary) {
            return new Response(JSON.stringify({ transcript: result.summary } as TranscriptResponse), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            return new Response(JSON.stringify({ error: 'Transcript not found.' } as ErrorResponse), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    } catch (error) {
        console.error('Error fetching transcript:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch transcript.' } as ErrorResponse), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
