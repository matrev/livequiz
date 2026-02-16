-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN "joincode" TEXT NOT NULL DEFAULT '',
ADD COLUMN "deadline" TIMESTAMP(3);

-- Update existing records with unique joincodes
UPDATE "Quiz" SET "joincode" = SUBSTR(MD5(RANDOM()::text || CLOCK_TIMESTAMP()::text), 1, 8) WHERE "joincode" = '';

-- CreateIndex
CREATE UNIQUE INDEX "Quiz_joincode_key" ON "Quiz"("joincode");
