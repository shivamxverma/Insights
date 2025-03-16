import { getAuthSession } from '@/lib/auth';
import { fetchCourses } from '@/lib/courseQuery'; // Assuming you have a function to fetch courses
import { redirect } from 'next/navigation';
import Courses from './courses';


const MyCourses = async () => {
  const session = await getAuthSession();

  if (!session) {
    redirect('/login');
  }

  let courses;
  try {
    courses = await fetchCourses(session.user.id); // Replace with your actual query function
  } catch (error) {
    console.error("Error in MyCourses:", error);
    return <div className="text-center text-red-500">Error loading courses</div>;
  }

  return (
    <div>
      <Courses courses={courses} />
    </div>
  );
};

export default MyCourses;