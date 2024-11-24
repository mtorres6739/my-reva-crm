/*
  Warnings:

  - You are about to drop the column `contact_id` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `end_time` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `start_time` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `events` table. All the data in the column will be lost.
  - Added the required column `createdById` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `events` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_contact_id_fkey";

-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_user_id_fkey";

-- DropIndex
DROP INDEX "events_start_time_idx";

-- DropIndex
DROP INDEX "events_user_id_idx";

-- AlterTable
ALTER TABLE "events" DROP COLUMN "contact_id",
DROP COLUMN "created_at",
DROP COLUMN "end_time",
DROP COLUMN "location",
DROP COLUMN "start_time",
DROP COLUMN "updated_at",
DROP COLUMN "user_id",
ADD COLUMN     "contactId" INTEGER,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdById" INTEGER NOT NULL,
ADD COLUMN     "end" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "start" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
