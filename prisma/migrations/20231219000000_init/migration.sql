-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'BROKER', 'AGENT');

-- CreateEnum
CREATE TYPE "ContactStatus" AS ENUM ('LEAD', 'SOI', 'CLIENT', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PolicyType" AS ENUM ('HOME', 'AUTO', 'LIFE', 'UMBRELLA', 'COMMERCIAL');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "supervisor_id" INTEGER REFERENCES "users"(id),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "birthdate" DATE,
    "workplace" TEXT,
    "notes" TEXT,
    "status" "ContactStatus" NOT NULL DEFAULT 'LEAD',
    "tags" JSONB,
    "assigned_to" INTEGER NOT NULL REFERENCES "users"(id),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "policies" (
    "id" SERIAL PRIMARY KEY,
    "contact_id" INTEGER NOT NULL REFERENCES "contacts"(id),
    "policy_number" TEXT NOT NULL,
    "type" "PolicyType" NOT NULL,
    "carrier" TEXT NOT NULL,
    "effective_date" DATE NOT NULL,
    "expiry_date" DATE NOT NULL,
    "monthly_premium" DECIMAL(10,2) NOT NULL,
    "annual_premium" DECIMAL(10,2) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "email_templates" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "created_by" INTEGER NOT NULL REFERENCES "users"(id),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "sms_templates" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "created_by" INTEGER NOT NULL REFERENCES "users"(id),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE INDEX "contacts_assigned_to_idx" ON "contacts"("assigned_to");
CREATE INDEX "contacts_status_idx" ON "contacts"("status");
CREATE INDEX "policies_contact_id_idx" ON "policies"("contact_id");
CREATE INDEX "policies_type_idx" ON "policies"("type");
