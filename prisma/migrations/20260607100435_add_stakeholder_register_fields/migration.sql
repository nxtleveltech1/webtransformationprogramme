-- CreateEnum
CREATE TYPE "ParticipantStatus" AS ENUM ('CONFIRMED', 'PENDING', 'TO_BE_CONFIRMED', 'INACTIVE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "StakeholderRoleType" ADD VALUE 'STEERCING_MEMBER';
ALTER TYPE "StakeholderRoleType" ADD VALUE 'CONSULTATION';
ALTER TYPE "StakeholderRoleType" ADD VALUE 'COMMUNICATION';
ALTER TYPE "StakeholderRoleType" ADD VALUE 'WORKING_TEAM';

-- AlterTable
ALTER TABLE "Person" ADD COLUMN     "nickname" TEXT,
ADD COLUMN     "participantStatus" "ParticipantStatus" NOT NULL DEFAULT 'CONFIRMED',
ADD COLUMN     "primaryContact" TEXT;

-- AlterTable
ALTER TABLE "StakeholderRole" ADD COLUMN     "roleLabel" TEXT;
