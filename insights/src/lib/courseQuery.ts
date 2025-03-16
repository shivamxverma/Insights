'use server';
import { prisma } from "./db";
import { Course } from "./types";

interface TranscriptProps {
    course: Course;
    unitIndex: number;
    chapterIndex: number;
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