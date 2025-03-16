/*
  Warnings:

  - You are about to drop the column `embeddingCreated` on the `Video` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Video" DROP COLUMN "embeddingCreated",
ADD COLUMN     "hasEmbedding" BOOLEAN NOT NULL DEFAULT false;
