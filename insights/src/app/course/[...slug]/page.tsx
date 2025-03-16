
import { redirect } from "next/navigation";
import { GetCourse } from "@/lib/query";
import { CourseLearning } from "./courseContent";

interface Chapter {
  id: string;
  name: string;
  videoId: string;
  courseQuiz: any[];
}

interface Unit {
  id: string;
  name: string;
  chapters: Chapter[];
}

interface Course {
  id: string;
  name: string;
  units: Unit[];
}

interface Props {
  params: Promise<{ slug: string[] }>;
}

export default async function CoursePage({ params }: Props) {
  const { slug } = await params;
  const [courseId, unitIndexParam, chapterIndexParam] = slug;

  const course = await GetCourse(courseId);
  // console.log(course?.units[0].chapters[0].courseQuiz);
  // console.log(course?.units[0].chapters);

  if (!course) {
    return redirect("/create");
  }

  const unitIndex = parseInt(unitIndexParam);
  const chapterIndex = parseInt(chapterIndexParam);

  const unit = course.units[unitIndex];
  if (!unit) {
    return redirect("/create");
  }
  const chapter = unit.chapters[chapterIndex];
  if (!chapter) {
    return redirect("/create");
  }

  return (
        <CourseLearning
          course={course}
          unitIndex={unitIndex}
          chapterIndex={chapterIndex}
        />
 
  );
}