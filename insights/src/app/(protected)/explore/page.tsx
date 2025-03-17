import { getAuthSession } from '@/lib/auth';
import { fetchCourses } from '@/lib/courseQuery'; // Updated function
import { redirect } from 'next/navigation';
import Courses from './courses';

const MyCourses = async () => {
  const session = await getAuthSession();

  if (!session) {
    redirect('/login');
  }

  let myCourses, allCourses;
  try {
    myCourses = await fetchCourses(session.user.id); // User's courses
    allCourses = await fetchCourses(session.user.id, true); // All courses
  } catch (error) {
    console.error("Error in MyCourses:", error);
    return <div className="text-center text-red-500">Error loading courses</div>;
  }

  return (
    <div>
      <Courses courses={myCourses} allCourses={allCourses} userId={session.user.id} />
    </div>
  );
};

export default MyCourses;