-- CreateEnum
CREATE TYPE "GovernmentIdType" AS ENUM ('DRIVERS_LICENCE', 'PASSPORT', 'OTHER');

-- AlterTable
ALTER TABLE "Contract" ADD COLUMN     "bondCents" INTEGER,
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "governmentIdNumber" TEXT,
ADD COLUMN     "governmentIdType" "GovernmentIdType",
ADD COLUMN     "insuranceProvider" TEXT,
ADD COLUMN     "leaseSigned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "leaseSignedAt" TIMESTAMP(3),
ADD COLUMN     "leaseSignedIp" TEXT,
ADD COLUMN     "leaseSignedName" TEXT,
ADD COLUMN     "leaseStartDate" TIMESTAMP(3),
ADD COLUMN     "vehicleRegistration" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emergencyContactRelationship" TEXT;
