-- AlterTable
ALTER TABLE "Contract" ADD COLUMN     "nextRentDueDate" TIMESTAMP(3),
ADD COLUMN     "rentLastPaidAt" TIMESTAMP(3),
ADD COLUMN     "rentTenantConfirmedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "PaymentSettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "bankDetails" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentSettings_pkey" PRIMARY KEY ("id")
);
