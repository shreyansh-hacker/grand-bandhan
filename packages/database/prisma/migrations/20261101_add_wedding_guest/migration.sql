-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "RsvpStatus" AS ENUM ('ATTENDING', 'DECLINED', 'PENDING');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "WeddingGuest" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "side" "PlanningForSide" NOT NULL DEFAULT 'NOT_SPECIFIED',
    "rsvpStatus" "RsvpStatus" NOT NULL DEFAULT 'PENDING',
    "guestCount" INTEGER NOT NULL DEFAULT 1,
    "dietaryPreference" TEXT,
    "roomAssigned" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeddingGuest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "WeddingGuest_weddingId_idx" ON "WeddingGuest"("weddingId");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "WeddingGuest" ADD CONSTRAINT "WeddingGuest_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
