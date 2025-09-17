/*
  Warnings:

  - You are about to alter the column `avgConsumption` on the `customer` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal(12,2)`.

*/
-- AlterTable
ALTER TABLE `customer` ADD COLUMN `adjustmentType` VARCHAR(191) NULL,
    ADD COLUMN `avgBilledAmount` DECIMAL(12, 2) NULL,
    ADD COLUMN `currentTotalAmount` DECIMAL(12, 2) NULL,
    ADD COLUMN `feedbackMarketer` VARCHAR(191) NULL,
    ADD COLUMN `finalAdjustment` DECIMAL(12, 2) NULL,
    ADD COLUMN `lastReadDate` DATETIME(3) NULL,
    ADD COLUMN `marketerName` VARCHAR(191) NULL,
    ADD COLUMN `pictorialEvidence` VARCHAR(191) NULL,
    ADD COLUMN `pictureReading` INTEGER NULL,
    ADD COLUMN `pictureReadingDate` DATETIME(3) NULL,
    ADD COLUMN `premiseType` VARCHAR(191) NULL,
    ADD COLUMN `premiseVisit` VARCHAR(191) NULL,
    ADD COLUMN `presentReading` INTEGER NULL,
    ADD COLUMN `previousAdjustment` DECIMAL(12, 2) NULL,
    ADD COLUMN `previousReading` INTEGER NULL,
    ADD COLUMN `proposedAdjustment` DECIMAL(12, 2) NULL,
    ADD COLUMN `readingConsistent` VARCHAR(191) NULL,
    ADD COLUMN `resultantBillingAmount` DECIMAL(12, 2) NULL,
    ADD COLUMN `totalConsumption` DECIMAL(12, 2) NULL,
    MODIFY `avgConsumption` DECIMAL(12, 2) NULL;
