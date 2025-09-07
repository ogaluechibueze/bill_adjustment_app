/*
  Warnings:

  - You are about to drop the column `endDate` on the `adjustment` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `adjustment` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `adjustment` table. All the data in the column will be lost.
  - You are about to drop the column `tariffRate` on the `adjustmentitem` table. All the data in the column will be lost.
  - Added the required column `tariff` to the `AdjustmentItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `adjustment` DROP COLUMN `endDate`,
    DROP COLUMN `startDate`,
    DROP COLUMN `totalAmount`,
    ADD COLUMN `adjustmentAmount` DECIMAL(12, 2) NULL,
    ADD COLUMN `adjustmentEndDate` DATETIME(3) NULL,
    ADD COLUMN `adjustmentStartDate` DATETIME(3) NULL,
    ADD COLUMN `balanceAfterAdjustment` DECIMAL(12, 2) NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `adjustmentitem` DROP COLUMN `tariffRate`,
    ADD COLUMN `tariff` DECIMAL(12, 2) NOT NULL;

-- AlterTable
ALTER TABLE `customer` ADD COLUMN `tariffClass` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `AdjustmentView` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `customerId` INTEGER NOT NULL,
    `adjustmentId` INTEGER NOT NULL,
    `month` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `consumption` DECIMAL(12, 2) NOT NULL,
    `tariff` DECIMAL(12, 2) NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
