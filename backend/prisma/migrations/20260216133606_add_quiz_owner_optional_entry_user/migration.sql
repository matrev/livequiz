/*
  Warnings:

  - You are about to drop the column `title` on the `Entry` table. All the data in the column will be lost.
  - Added the required column `name` to the `Entry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Quiz` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Entry" DROP CONSTRAINT "Entry_authorId_fkey";

-- AlterTable
ALTER TABLE "Entry" DROP COLUMN "title",
ADD COLUMN     "name" TEXT NOT NULL,
ALTER COLUMN "authorId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
