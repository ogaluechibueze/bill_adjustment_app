/*
  Warnings:

  - You are about to drop the column `caoremarks` on the `customer` table. All the data in the column will be lost.
  - You are about to drop the column `ccoremarks` on the `customer` table. All the data in the column will be lost.
  - You are about to alter the column `approvalStage` on the `customer` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(2))` to `Enum(EnumId(2))`.
  - The values [CCO,CAO] on the enum `User_role` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[globalAcctNo]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `customer` DROP COLUMN `caoremarks`,
    DROP COLUMN `ccoremarks`,
    ADD COLUMN `airemarks` VARCHAR(191) NULL,
    ADD COLUMN `bmremarks` VARCHAR(191) NULL,
    ADD COLUMN `ciaremarks` VARCHAR(191) NULL,
    ADD COLUMN `customerType` VARCHAR(191) NULL,
    ADD COLUMN `hccremarks` VARCHAR(191) NULL,
    ADD COLUMN `meterNumber` VARCHAR(191) NULL,
    ADD COLUMN `raremarks` VARCHAR(191) NULL,
    ADD COLUMN `rhremarks` VARCHAR(191) NULL,
    MODIFY `approvalStage` ENUM('HCC', 'BM', 'RH', 'RA', 'IA', 'CIA', 'MD') NOT NULL DEFAULT 'HCC';

-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('CCRO', 'HCC', 'BM', 'RH', 'RA', 'IA', 'CIA', 'MD') NOT NULL;

-- CreateTable
CREATE TABLE `FeederConsumption` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `feederName` VARCHAR(191) NOT NULL,
    `month` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `consumption` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tariff` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `feederName` VARCHAR(191) NOT NULL,
    `band` VARCHAR(191) NOT NULL,
    `month` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `rate` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Customer_globalAcctNo_key` ON `Customer`(`globalAcctNo`);
