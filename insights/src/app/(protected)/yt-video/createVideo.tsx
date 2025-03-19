'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, BookOpen, User, Globe, Subtitles, FileText } from 'lucide-react';

interface Module {
  id: string;
  name: string;
}

interface CreateVideoClientProps {
  userId: string;
  modules: Module[];
}

export default function CreateVideoClient({ userId, modules }: CreateVideoClientProps) {
  const [url, setUrl] = useState('');
  const [action, setAction] = useState<'single' | 'playlist' | 'new' | 'newPlaylist'>('single');
  const [moduleId, setModuleId] = useState<string>('');
  const [moduleName, setModuleName] = useState<string>('');
  const router = useRouter();
  const queryClient = useQueryClient();

  // Helper to extract video ID and playlist ID from a YouTube URL
  function getYouTubeIds(youtubeUrl: string): { videoId: string | null; playlistId: string | null } {
    try {
      const urlObj = new URL(youtubeUrl);
      const videoId = urlObj.searchParams.get('v') || null;
      const playlistId = urlObj.searchParams.get('list') || null;
      return { videoId, playlistId };
    } catch {
      return { videoId: null, playlistId: null };
    }
  }

  // Mutation for adding a video or playlist
  const { mutate: addToModule, isPending: isAddingPending } = useMutation({
    mutationFn: async () => {
      const { videoId, playlistId } = getYouTubeIds(url);

      // Validate URL and IDs
      if (!url.trim()) throw new Error('Please enter a YouTube URL');
      if (!videoId && !playlistId) throw new Error('Invalid YouTube URL: No video or playlist ID found');

      // Validate module selection or name based on action
      if ((action === 'single' || action === 'playlist') && !moduleId && modules.length > 0) {
        throw new Error('Please select a module');
      }
      if ((action === 'new' || action === 'newPlaylist') && !moduleName.trim()) {
        throw new Error('Module name is required');
      }

      // Prepare payload based on action
      const payload = {
        userId,
        videoId: action === 'single' || action === 'new' ? videoId : null,
        playlistId: action === 'playlist' || action === 'newPlaylist' ? playlistId : null,
        moduleId: action === 'single' || action === 'playlist' ? moduleId : null,
        action,
        newModuleName: (action === 'new' || action === 'newPlaylist') ? moduleName : undefined,
      };

      const response = await axios.post<{ module: { id: string } }>('/api/add-to-module', payload);
      return response.data;
    },
    onSuccess: ({ module }) => {
      const { videoId } = getYouTubeIds(url);
      toast.success('Video or playlist added to module',{
        style: {
          backgroundColor: "green", // Red for destructive
          color: "white",
        },
      });
      queryClient.invalidateQueries({ queryKey: ['modules', userId] });
      router.push(`/video-modules/${module.id}${videoId ? `/${videoId}` : ''}`);
    },
    onError: (error: any) => {
      // console.error(error);
      toast.error(error.message || 'Failed to add video or playlist to module',{
        style: {
          backgroundColor: "#dc2626", // Red for destructive
          color: "white",
        },
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addToModule();
  };

  const { videoId, playlistId } = getYouTubeIds(url);
  const isFormValid =
    url.trim() &&
    ((action === 'single' && videoId) || (action === 'playlist' && playlistId) || (action === 'new' && moduleName.trim()) || (action === 'newPlaylist' && playlistId && moduleName.trim())) &&
    ((action === 'single' || action === 'playlist') ? !!moduleId : true);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-foreground">
      <div className="container mx-auto px-4 py-16">
        {/* Header Section */}
        <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 dark:text-gray-100 mb-8 transition-all duration-300 hover:text-blue-500 dark:hover:text-blue-300">
          Add a YouTube Video to Your Learning Module
        </h1>

        {/* URL Input Section */}
        <div className="flex items-center gap-4 mb-8">
          <Input
            type="text"
            placeholder="Enter the YouTube video link, for example: https://www.youtube.com/watch?v=example"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 py-3 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-blue-500 dark:focus:border-blue-300 transition-all duration-200 hover:shadow-md focus:shadow-lg"
          />
        </div>

        {/* Form Section */}
        {url && (videoId || playlistId) ? (
          <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 transition-colors duration-200 hover:text-blue-500 dark:hover:text-blue-300">
                  <input
                    type="radio"
                    value="single"
                    checked={action === 'single'}
                    onChange={() => setAction('single')}
                    className="text-blue-500 focus:ring-blue-500 dark:text-blue-300 dark:focus:ring-blue-300 transition-transform duration-200 hover:scale-110"
                    disabled={!videoId}
                  />
                  <span>Add only this video</span>
                </label>
                {playlistId && (
                  <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 transition-colors duration-200 hover:text-blue-500 dark:hover:text-blue-300">
                    <input
                      type="radio"
                      value="playlist"
                      checked={action === 'playlist'}
                      onChange={() => setAction('playlist')}
                      className="text-blue-500 focus:ring-blue-500 dark:text-blue-300 dark:focus:ring-blue-300 transition-transform duration-200 hover:scale-110"
                    />
                    <span>Add entire playlist</span>
                  </label>
                )}
                {playlistId && (
                  <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 transition-colors duration-200 hover:text-blue-500 dark:hover:text-blue-300">
                    <input
                      type="radio"
                      value="newPlaylist"
                      checked={action === 'newPlaylist'}
                      onChange={() => setAction('newPlaylist')}
                      className="text-blue-500 focus:ring-blue-500 dark:text-blue-300 dark:focus:ring-blue-300 transition-transform duration-200 hover:scale-110"
                    />
                    <span>Create new module with playlist</span>
                  </label>
                )}
                <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 transition-colors duration-200 hover:text-blue-500 dark:hover:text-blue-300">
                  <input
                    type="radio"
                    value="new"
                    checked={action === 'new'}
                    onChange={() => setAction('new')}
                    className="text-blue-500 focus:ring-blue-500 dark:text-blue-300 dark:focus:ring-blue-300 transition-transform duration-200 hover:scale-110"
                  />
                  <span>Create new module</span>
                </label>
              </div>

              {(action === 'new' || action === 'newPlaylist') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200 hover:text-blue-500 dark:hover:text-blue-300">
                    Module Name:
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter the module name"
                    value={moduleName}
                    onChange={(e) => setModuleName(e.target.value)}
                    className="w-full py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-blue-500 dark:focus:border-blue-300 transition-all duration-200 hover:shadow-md focus:shadow-lg"
                  />
                </div>
              )}

              {(action === 'single' || action === 'playlist') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200 hover:text-blue-500 dark:hover:text-blue-300">
                    Select Module:
                  </label>
                  <select
                    value={moduleId}
                    onChange={(e) => setModuleId(e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-300 transition-all duration-200 hover:shadow-md"
                  >
                    <option value="" className="text-gray-400 dark:text-gray-500">
                      -- Select a module --
                    </option>
                    {modules.map((m) => (
                      <option key={m.id} value={m.id} className="text-gray-800 dark:text-gray-200">
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={!isFormValid || isAddingPending}
              className="w-full py-3 font-semibold bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-500 transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAddingPending ? 'Submitting...' : 'Submit'}
            </Button>
          </form>
        ) : (
          <p className="text-center text-gray-600 dark:text-gray-300 transition-opacity duration-300 hover:opacity-80">
            Please enter a valid YouTube URL to proceed.
          </p>
        )}

        {/* Feature Showcase Section */}
        <div className="mt-12">
          <h2 className="text-2xl md:text-3xl font-semibold text-center text-gray-800 dark:text-gray-100 mb-8 transition-all duration-300 hover:text-blue-500 dark:hover:text-blue-300">
            Why Use Insights?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Clock,
                title: 'Time-Saving',
                description:
                  'Get transcriptions and summaries in seconds, quickly decide if you want to continue watching, without any ads.',
              },
              {
                icon: BookOpen,
                title: 'Perfect for Learning',
                description:
                  'Helps you understand videos through Highlights, Key Insights, Outline, Core Concepts, FAQs, AI Chat, and more.',
              },
              {
                icon: User,
                title: 'Personalized for You',
                description:
                  'Customize summary prompts, depth, length, tone, and more to fit your needs.',
              },
              {
                icon: Globe,
                title: '100+ Languages',
                description:
                  'Transcribe and summarize in over 100 languages, easily access global content.',
              },
              {
                icon: Subtitles,
                title: 'No-Subtitle YouTube',
                description:
                  'Transcribe YouTube videos without subtitles (up to 40min), and for videos with subtitles, there’s no length limit.',
              },
              {
                icon: FileText,
                title: 'Timestamped Transcripts',
                description:
                  'Get the transcripts with timestamps and download subtitles for easy reference.',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <feature.icon className="h-8 w-8 mb-4 text-blue-500 dark:text-blue-300 transition-transform duration-200 hover:scale-110" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2 transition-colors duration-200 hover:text-blue-500 dark:hover:text-blue-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm transition-opacity duration-200 hover:opacity-90">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}