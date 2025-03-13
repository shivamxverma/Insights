-- CreateTable
CREATE TABLE "webAnalysis" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "url" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "webAnalysis_url_key" ON "webAnalysis"("url");

-- AddForeignKey
ALTER TABLE "webAnalysis" ADD CONSTRAINT "webAnalysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
