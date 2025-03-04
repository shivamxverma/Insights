-- AlterTable
ALTER TABLE "User" ADD COLUMN     "credits" INTEGER NOT NULL DEFAULT 5;

-- CreateTable
CREATE TABLE "VideoModule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'New Module',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "originalModuleId" TEXT,

    CONSTRAINT "VideoModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "url" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "summary" TEXT,
    "moduleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quiz" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL DEFAULT '',
    "options" TEXT NOT NULL,

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "videoModule_userId_index" ON "VideoModule"("userId");

-- CreateIndex
CREATE INDEX "video_moduleId_index" ON "Video"("moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "Video_moduleId_videoId_key" ON "Video"("moduleId", "videoId");

-- CreateIndex
CREATE INDEX "Quiz_videoId_idx" ON "Quiz"("videoId");

-- AddForeignKey
ALTER TABLE "VideoModule" ADD CONSTRAINT "VideoModule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "VideoModule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;
