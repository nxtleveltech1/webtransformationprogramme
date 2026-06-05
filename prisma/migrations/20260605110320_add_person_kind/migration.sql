-- CreateEnum
CREATE TYPE "PersonKind" AS ENUM ('PERSON', 'GROUP');

-- AlterTable
ALTER TABLE "Person" ADD COLUMN     "kind" "PersonKind" NOT NULL DEFAULT 'PERSON';

-- CreateIndex
CREATE INDEX "Person_kind_idx" ON "Person"("kind");
