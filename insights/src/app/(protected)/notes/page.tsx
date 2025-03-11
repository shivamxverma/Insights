import { getAuthSession } from '@/lib/auth';
import { fetchModuleVideos } from '@/lib/query';
import { redirect } from 'next/navigation';
import React from 'react';
import VideoModules from './modules';

const MyModules = async () => {
  const session = await getAuthSession();

  if (!session) {
    redirect('/login');
  }
  // ✅ Fetch modules only once at component level
  const modules = await fetchModuleVideos(session.user.id);
  // console.log(modules[0].videos[0].videoId); 

  return (
    <div>
      <VideoModules modules={modules} />
     </div>
  );
};
export default MyModules;

