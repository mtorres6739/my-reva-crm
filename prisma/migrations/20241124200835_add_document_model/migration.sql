/*
  Warnings:

  - You are about to drop the column `file_url` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `uploaded_by` on the `documents` table. All the data in the column will be lost.
  - Added the required column `file_name` to the `documents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_path` to the `documents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_size` to the `documents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_type` to the `documents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `documents` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "documents" DROP CONSTRAINT "documents_contact_id_fkey";

-- DropForeignKey
ALTER TABLE "documents" DROP CONSTRAINT "documents_uploaded_by_fkey";

-- DropIndex
DROP INDEX "documents_type_idx";

-- AlterTable
ALTER TABLE "documents" DROP COLUMN "file_url",
DROP COLUMN "name",
DROP COLUMN "uploaded_by",
ADD COLUMN     "file_name" TEXT NOT NULL,
ADD COLUMN     "file_path" TEXT NOT NULL,
ADD COLUMN     "file_size" INTEGER NOT NULL,
ADD COLUMN     "file_type" TEXT NOT NULL,
ADD COLUMN     "task_id" INTEGER,
ADD COLUMN     "user_id" INTEGER NOT NULL,
ALTER COLUMN "type" DROP NOT NULL,
ALTER COLUMN "type" SET DEFAULT 'OTHER',
ALTER COLUMN "contact_id" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "documents_user_id_idx" ON "documents"("user_id");

-- CreateIndex
CREATE INDEX "documents_task_id_idx" ON "documents"("task_id");

-- CreateIndex
CREATE INDEX "documents_policy_id_idx" ON "documents"("policy_id");

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
