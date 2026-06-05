-- CreateEnum
CREATE TYPE "ContactVisibility" AS ENUM ('PUBLIC_INTERNAL', 'RESTRICTED', 'NAME_ONLY');

-- CreateEnum
CREATE TYPE "ProgrammeRoleType" AS ENUM ('STREAM_LEAD', 'PRODUCT_OWNER', 'SME', 'GATEKEEPER', 'FACILITATOR', 'TECHNICAL_ARCHITECT', 'BUSINESS_STAKEHOLDER', 'SPONSOR', 'CONTRIBUTOR', 'PROGRAMME_DIRECTOR', 'SCRIBE', 'EXECUTIVE_SPONSOR');

-- CreateEnum
CREATE TYPE "GovernanceDocType" AS ENUM ('TERMS_OF_REFERENCE', 'POLICY', 'STANDARD', 'DEFINITION_SET');

-- CreateEnum
CREATE TYPE "GovernanceDocStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- AlterEnum
ALTER TYPE "GlossaryCategory" ADD VALUE 'GEOGRAPHY';

-- AlterTable
ALTER TABLE "Person" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "areaId" TEXT,
ADD COLUMN     "businessId" TEXT,
ADD COLUMN     "clusterId" TEXT,
ADD COLUMN     "contactVisibility" "ContactVisibility" NOT NULL DEFAULT 'PUBLIC_INTERNAL',
ADD COLUMN     "dataOwnerPersonId" TEXT,
ADD COLUMN     "department" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "mobile" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "primaryWorkstreamId" TEXT;

-- CreateTable
CREATE TABLE "DirectoryArea" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DirectoryArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DirectoryBusiness" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DirectoryBusiness_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DirectoryCluster" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "audienceLabel" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DirectoryCluster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgrammeRoleAssignment" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "roleType" "ProgrammeRoleType" NOT NULL,
    "scope" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "workstreamId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgrammeRoleAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GovernanceReferenceDoc" (
    "id" TEXT NOT NULL,
    "type" "GovernanceDocType" NOT NULL DEFAULT 'TERMS_OF_REFERENCE',
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "status" "GovernanceDocStatus" NOT NULL DEFAULT 'DRAFT',
    "summary" TEXT,
    "programmeId" TEXT,
    "ownerPersonId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GovernanceReferenceDoc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GovernanceReferenceSection" (
    "id" TEXT NOT NULL,
    "docId" TEXT NOT NULL,
    "heading" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "parentSectionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GovernanceReferenceSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferenceMapping" (
    "id" TEXT NOT NULL,
    "conceptKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "glossaryTermId" TEXT,
    "entityType" TEXT,
    "fieldPath" TEXT,
    "processName" TEXT,
    "relatedDocSectionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReferenceMapping_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DirectoryArea_key_key" ON "DirectoryArea"("key");

-- CreateIndex
CREATE UNIQUE INDEX "DirectoryBusiness_key_key" ON "DirectoryBusiness"("key");

-- CreateIndex
CREATE UNIQUE INDEX "DirectoryCluster_key_key" ON "DirectoryCluster"("key");

-- CreateIndex
CREATE INDEX "ProgrammeRoleAssignment_personId_idx" ON "ProgrammeRoleAssignment"("personId");

-- CreateIndex
CREATE INDEX "ProgrammeRoleAssignment_roleType_idx" ON "ProgrammeRoleAssignment"("roleType");

-- CreateIndex
CREATE UNIQUE INDEX "ProgrammeRoleAssignment_personId_roleType_scope_key" ON "ProgrammeRoleAssignment"("personId", "roleType", "scope");

-- CreateIndex
CREATE UNIQUE INDEX "GovernanceReferenceDoc_slug_key" ON "GovernanceReferenceDoc"("slug");

-- CreateIndex
CREATE INDEX "GovernanceReferenceDoc_type_idx" ON "GovernanceReferenceDoc"("type");

-- CreateIndex
CREATE INDEX "GovernanceReferenceDoc_status_idx" ON "GovernanceReferenceDoc"("status");

-- CreateIndex
CREATE INDEX "GovernanceReferenceSection_docId_idx" ON "GovernanceReferenceSection"("docId");

-- CreateIndex
CREATE INDEX "GovernanceReferenceSection_parentSectionId_idx" ON "GovernanceReferenceSection"("parentSectionId");

-- CreateIndex
CREATE INDEX "ReferenceMapping_conceptKey_idx" ON "ReferenceMapping"("conceptKey");

-- CreateIndex
CREATE INDEX "ReferenceMapping_glossaryTermId_idx" ON "ReferenceMapping"("glossaryTermId");

-- CreateIndex
CREATE INDEX "Person_areaId_idx" ON "Person"("areaId");

-- CreateIndex
CREATE INDEX "Person_businessId_idx" ON "Person"("businessId");

-- CreateIndex
CREATE INDEX "Person_clusterId_idx" ON "Person"("clusterId");

-- CreateIndex
CREATE INDEX "Person_active_idx" ON "Person"("active");

-- CreateIndex
CREATE INDEX "Person_primaryWorkstreamId_idx" ON "Person"("primaryWorkstreamId");

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "DirectoryArea"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "DirectoryBusiness"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "DirectoryCluster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_primaryWorkstreamId_fkey" FOREIGN KEY ("primaryWorkstreamId") REFERENCES "Workstream"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_dataOwnerPersonId_fkey" FOREIGN KEY ("dataOwnerPersonId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgrammeRoleAssignment" ADD CONSTRAINT "ProgrammeRoleAssignment_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgrammeRoleAssignment" ADD CONSTRAINT "ProgrammeRoleAssignment_workstreamId_fkey" FOREIGN KEY ("workstreamId") REFERENCES "Workstream"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GovernanceReferenceDoc" ADD CONSTRAINT "GovernanceReferenceDoc_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES "Programme"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GovernanceReferenceDoc" ADD CONSTRAINT "GovernanceReferenceDoc_ownerPersonId_fkey" FOREIGN KEY ("ownerPersonId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GovernanceReferenceSection" ADD CONSTRAINT "GovernanceReferenceSection_docId_fkey" FOREIGN KEY ("docId") REFERENCES "GovernanceReferenceDoc"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GovernanceReferenceSection" ADD CONSTRAINT "GovernanceReferenceSection_parentSectionId_fkey" FOREIGN KEY ("parentSectionId") REFERENCES "GovernanceReferenceSection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferenceMapping" ADD CONSTRAINT "ReferenceMapping_glossaryTermId_fkey" FOREIGN KEY ("glossaryTermId") REFERENCES "GlossaryTerm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferenceMapping" ADD CONSTRAINT "ReferenceMapping_relatedDocSectionId_fkey" FOREIGN KEY ("relatedDocSectionId") REFERENCES "GovernanceReferenceSection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
