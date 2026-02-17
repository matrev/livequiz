/*
  Warnings:

  - You are about to drop the column `authorId` on the `Entry` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[quizId,userId]` on the table `Entry` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Entry" DROP CONSTRAINT "Entry_authorId_fkey";

-- DropIndex
DROP INDEX "Entry_quizId_authorId_key";

-- AlterTable
ALTER TABLE "Entry" DROP COLUMN "authorId",
ADD COLUMN     "userId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Entry_quizId_userId_key" ON "Entry"("quizId", "userId");

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
