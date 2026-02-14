/*
  Warnings:

  - A unique constraint covering the columns `[quizId,authorId]` on the table `Entry` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `answers` to the `Entry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Entry` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Entry" ADD COLUMN     "answers" JSONB NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Entry_quizId_authorId_key" ON "Entry"("quizId", "authorId");
