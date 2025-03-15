-- DropForeignKey
ALTER TABLE "Video" DROP CONSTRAINT "Video_moduleId_fkey";

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "VideoModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
