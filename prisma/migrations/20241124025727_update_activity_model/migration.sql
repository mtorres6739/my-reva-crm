/*
  Warnings:

  - You are about to drop the column `task_id` on the `activities` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "activities" DROP CONSTRAINT "activities_task_id_fkey";

-- DropIndex
DROP INDEX "activities_task_id_idx";

-- AlterTable
ALTER TABLE "activities" DROP COLUMN "task_id",
ADD COLUMN     "task_data" JSONB;
