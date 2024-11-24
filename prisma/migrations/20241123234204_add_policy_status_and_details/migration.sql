-- CreateEnum
CREATE TYPE "PolicyStatus" AS ENUM ('ACTIVE', 'PENDING', 'RENEWAL');

-- AlterTable
ALTER TABLE "policies" ADD COLUMN     "details" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "status" "PolicyStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateIndex
CREATE INDEX "policies_status_idx" ON "policies"("status");
