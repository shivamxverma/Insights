'use server';
import { cos } from "mathjs";
import { prisma } from "./db";
import { Course } from "./types";
import { generateQuestions, generateSummary } from "./gemini";

interface TranscriptProps {
    course: Course;
    unitIndex: number;
    chapterIndex: number;
  }

  interface GeneratedQuestion {
    question: string;
    answer: string;
    options: string[];
  }
  
  interface QuizCreationData {
    chapterId: string; 
    question: string;
    answer: string;
    options: string; 
  }
  
export async function GetTranscriptFromDB({course , unitIndex , chapterIndex} : TranscriptProps) {
    const unitId = course.units[unitIndex].id;
    const chapterId = course.units[unitIndex].chapters[chapterIndex].id;
    // console.log("unitId" , unitId , "chapterId" , chapterId)

    try{
        const transcript = await prisma.unit.findFirst({
            where :{
                id : unitId
            },
            include : {
                chapters : {
                    where : {
                        id : chapterId
                    },
                    select : {
                        transcript : true
                    }
                }
            }
        })
        // console.log("tansd frm db" , transcript?.chapters[0].transcript)
        return transcript?.chapters[0].transcript;
    }
    catch(error){
        console.error(error);
    }

}

export async function CourseGeneratedSummary( chapterId : string){
    try{
        const chapter = await prisma.chapter.findFirst({
            where : {
                id : chapterId
            }
        })

        if(chapter?.generatedSummary){
            return chapter.generatedSummary;
        }

        if(chapter?.transcript){
            const transcript = chapter.transcript;
            const summary = await generateSummary(transcript);
            await prisma.chapter.update({
                where : {
                    id : chapterId
                },
                data : {
                    generatedSummary : summary      
                }
            })
            return summary;
    }
}
    catch(error){
        console.error(error);
    }

}

export async function CreateCourseQuizz(chapterId: string): Promise<any> {
  console.log("ChapterId:", chapterId);

  try {
    const existingQuizzes = await prisma.courseQuiz.findMany({
      where: {
        chapterId: chapterId,
      },
    });

    if (existingQuizzes.length > 0) {
      console.log(`Quizzes already exist for chapter ${chapterId}`);
      return existingQuizzes;
    }

    const chapter = await prisma.chapter.findFirst({
      where: {
        id: chapterId,
      },
      select: {
        transcript: true,
      },
    });

    if (!chapter || !chapter.transcript) {
      console.warn("No transcript found for chapter", chapterId);
      return null; 
    }

    const generatedQuestions = await generateQuestions(chapter.transcript, "Video Quiz");

    if (!generatedQuestions || generatedQuestions.length === 0) {
      console.warn("No questions generated for chapter", chapterId);
      return null; 
    }

    const quizData: QuizCreationData[] = generatedQuestions.map((q: GeneratedQuestion) => ({
      chapterId: chapterId,
      question: q.question,
      answer: q.answer,
      options: JSON.stringify(q.options),
    }));

    const createdQuizzes = await prisma.courseQuiz.createMany({
      data: quizData,
    });

    // console.log(`Created ${createdQuizzes.count} quiz questions for chapter ${chapterId}`);
    return await prisma.courseQuiz.findMany({
      where: {
        chapterId: chapterId,
      },
    }); 
  } catch (error) {
    console.error(`Error creating quiz for chapter ${chapterId}:`, error);
    throw new Error("Failed to create course quiz"); 
  } 
}

export async function DeleteCourse(courseId: string , userId: string) {
  try {
    await prisma.course.delete({
      where: {
        userId: userId,
        id: courseId,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting course:", error);
    return { 
      success: false ,
      message : "not authorized"
    };
  } 
}
export async function fetchCourses(userId: string, all = false) {
  try {
    let courses;
    if (all) {
      // Fetch all courses
      courses = await prisma.course.findMany({
        include: {
          units: {
            include: {
              chapters: true, // Include chapters for thumbnail logic
            },
          },
        },
      });
    } else {
      // Fetch only the user's courses
      courses = await prisma.course.findMany({
        where: {
          userId: userId, // Assuming a userId field links courses to users
        },
        include: {
          units: {
            include: {
              chapters: true, // Include chapters for thumbnail logic
            },
          },
        },
      });
    }
    return courses;
  } catch (error) {
    console.error("Error fetching courses:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

export async function DeleteChapter(chapterId: string , userId: string) {
  try {
    await prisma.course.delete({
      where: {
        userId: userId,
        id: chapterId,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting course:", error);
    return { 
      success: false ,
      message : "not authorized"
    };
  } 
}