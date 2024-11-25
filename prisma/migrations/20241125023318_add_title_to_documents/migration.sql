/*
  Warnings:

  - You are about to drop the column `file_name` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `file_path` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `file_size` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `file_type` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `task_id` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `profile_picture` on the `users` table. All the data in the column will be lost.
  - Added the required column `file_url` to the `documents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `documents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uploaded_by` to the `documents` table without a default value. This is not possible if the table is not empty.
  - Made the column `type` on table `documents` required. This step will fail if there are existing NULL values in that column.
  - Made the column `contact_id` on table `documents` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "documents" DROP CONSTRAINT "documents_contact_id_fkey";

-- DropForeignKey
ALTER TABLE "documents" DROP CONSTRAINT "documents_task_id_fkey";

-- DropForeignKey
ALTER TABLE "documents" DROP CONSTRAINT "documents_user_id_fkey";

-- DropIndex
DROP INDEX "documents_policy_id_idx";

-- DropIndex
DROP INDEX "documents_task_id_idx";

-- DropIndex
DROP INDEX "documents_user_id_idx";

-- AlterTable
ALTER TABLE "documents" DROP COLUMN "file_name",
DROP COLUMN "file_path",
DROP COLUMN "file_size",
DROP COLUMN "file_type",
DROP COLUMN "task_id",
DROP COLUMN "user_id",
ADD COLUMN     "file_url" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "uploaded_by" INTEGER NOT NULL,
ALTER COLUMN "type" SET NOT NULL,
ALTER COLUMN "type" DROP DEFAULT,
ALTER COLUMN "contact_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "profile_picture";

-- CreateIndex
CREATE INDEX "documents_type_idx" ON "documents"("type");

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
