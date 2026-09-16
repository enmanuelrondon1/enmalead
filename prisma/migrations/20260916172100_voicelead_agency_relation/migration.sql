/*
  Warnings:

  - Added the required column `agencyId` to the `VoiceLead` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "VoiceLead" DROP CONSTRAINT "VoiceLead_propertyId_fkey";

-- AlterTable
ALTER TABLE "VoiceLead" ADD COLUMN     "agencyId" TEXT NOT NULL,
ADD COLUMN     "propertyOfInterest" TEXT,
ALTER COLUMN "propertyId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "VoiceLead" ADD CONSTRAINT "VoiceLead_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoiceLead" ADD CONSTRAINT "VoiceLead_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;
