-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "options" TEXT[] DEFAULT ARRAY[]::TEXT[];
