/*
  Warnings:

  - You are about to drop the column `band` on the `tariff` table. All the data in the column will be lost.
  - You are about to drop the column `feederName` on the `tariff` table. All the data in the column will be lost.
  - You are about to drop the `feederconsumption` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `tariffClassId` to the `Tariff` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `tariff` DROP COLUMN `band`,
    DROP COLUMN `feederName`,
    ADD COLUMN `tariffClassId` INTEGER NOT NULL,
    MODIFY `rate` DECIMAL(12, 4) NOT NULL;

-- DropTable
DROP TABLE `feederconsumption`;

-- CreateTable
CREATE TABLE `CustomerDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `globalAcctNo` VARCHAR(191) NOT NULL,
    `customerName` VARCHAR(191) NOT NULL,
    `customerAddress` VARCHAR(191) NULL,
    `region` VARCHAR(191) NULL,
    `businessUnit` VARCHAR(191) NULL,
    `serviceUnit` VARCHAR(191) NULL,
    `customerType` VARCHAR(191) NULL,
    `meterNumber` VARCHAR(191) NULL,
    `tariffClassId` INTEGER NULL,
    `band` VARCHAR(191) NULL,
    `feederId` INTEGER NULL,
    `feederName11kv` VARCHAR(191) NOT NULL,
    `feederName33kv` VARCHAR(191) NULL,
    `source` VARCHAR(191) NULL,
    `ticketNo` VARCHAR(191) NULL,
    `billStatus` VARCHAR(191) NULL,
    `transformerName` VARCHAR(191) NULL,
    `amountBilled` DECIMAL(12, 2) NULL,
    `totalOutstanding` DECIMAL(12, 2) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Consumption` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `feederId` INTEGER NOT NULL,
    `month` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `consumption` DECIMAL(12, 2) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TariffClass` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `TariffClass_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Feeder` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Feeder_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CustomerDetails` ADD CONSTRAINT `CustomerDetails_tariffClassId_fkey` FOREIGN KEY (`tariffClassId`) REFERENCES `TariffClass`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CustomerDetails` ADD CONSTRAINT `CustomerDetails_feederId_fkey` FOREIGN KEY (`feederId`) REFERENCES `Feeder`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Consumption` ADD CONSTRAINT `Consumption_feederId_fkey` FOREIGN KEY (`feederId`) REFERENCES `Feeder`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tariff` ADD CONSTRAINT `Tariff_tariffClassId_fkey` FOREIGN KEY (`tariffClassId`) REFERENCES `TariffClass`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
