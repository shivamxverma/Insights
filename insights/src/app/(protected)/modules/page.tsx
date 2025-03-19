
import { getAuthSession } from '@/lib/auth';
import { fetchModuleVideos } from '@/lib/query';
import { redirect } from 'next/navigation';
import VideoModules from './modules';

const MyModules = async () => {
  const session = await getAuthSession();

  if (!session) {
    redirect('/login');
  }

  let modules;
  try {
    modules = await fetchModuleVideos(session.user.id);
  } catch (error) {
    // console.error("Error in MyModules:", error);
    return <div className="text-center text-red-500">Error loading modules</div>;
  }

  return (
    <div>
      <VideoModules modules={modules} />
    </div>
  );
};

export default MyModules;