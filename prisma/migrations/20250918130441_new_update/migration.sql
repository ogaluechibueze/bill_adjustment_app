-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('CCRO', 'HCC', 'BM', 'RH', 'RA', 'IA', 'CIA', 'MD', 'ADMIN') NOT NULL,
    `bussinessUnit` VARCHAR(191) NOT NULL,
    `region` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Customer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `globalAcctNo` VARCHAR(191) NOT NULL,
    `customerName` VARCHAR(191) NOT NULL,
    `region` VARCHAR(191) NULL,
    `businessUnit` VARCHAR(191) NULL,
    `customerType` VARCHAR(191) NULL,
    `tariffClass` VARCHAR(191) NULL,
    `meterNumber` VARCHAR(191) NULL,
    `band` VARCHAR(191) NULL,
    `marketerName` VARCHAR(191) NULL,
    `feedbackMarketer` VARCHAR(191) NULL,
    `pictorialEvidence` VARCHAR(191) NULL,
    `feederId` INTEGER NULL,
    `feederName` VARCHAR(191) NULL,
    `source` VARCHAR(191) NULL,
    `previousReading` INTEGER NULL,
    `presentReading` INTEGER NULL,
    `lastReadDate` DATETIME(3) NULL,
    `readingConsistent` VARCHAR(191) NULL,
    `pictureReading` INTEGER NULL,
    `pictureReadingDate` DATETIME(3) NULL,
    `premiseVisit` VARCHAR(191) NULL,
    `premiseType` VARCHAR(191) NULL,
    `ticketNo` VARCHAR(191) NULL,
    `initialDebt` DECIMAL(12, 2) NULL,
    `adjustmentAmount` DECIMAL(12, 2) NULL,
    `avgConsumption` DECIMAL(12, 2) NULL,
    `totalConsumption` DECIMAL(12, 2) NULL,
    `avgBilledAmount` DECIMAL(12, 2) NULL,
    `balanceAfterAdjustment` DECIMAL(12, 2) NULL,
    `adjustmentStartDate` DATETIME(3) NULL,
    `adjustmentEndDate` DATETIME(3) NULL,
    `adjustmentPeriod` INTEGER NULL,
    `defaultCapUnit` DECIMAL(12, 2) NULL,
    `previousAdjustment` DECIMAL(12, 2) NULL,
    `proposedAdjustment` DECIMAL(12, 2) NULL,
    `finalAdjustment` DECIMAL(12, 2) NULL,
    `adjustmentType` VARCHAR(191) NULL,
    `resultantBillingAmount` DECIMAL(12, 2) NULL,
    `currentTotalAmount` DECIMAL(12, 2) NULL,
    `ccroremarks` VARCHAR(191) NULL,
    `hccremarks` VARCHAR(191) NULL,
    `bmremarks` VARCHAR(191) NULL,
    `rhremarks` VARCHAR(191) NULL,
    `raremarks` VARCHAR(191) NULL,
    `iaremarks` VARCHAR(191) NULL,
    `ciaremarks` VARCHAR(191) NULL,
    `mdremarks` VARCHAR(191) NULL,
    `status` ENUM('Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Pending',
    `approvalStage` ENUM('CCRO', 'HCC', 'BM', 'RH', 'RA', 'IA', 'CIA', 'MD') NOT NULL DEFAULT 'HCC',
    `createdById` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Customer_globalAcctNo_key`(`globalAcctNo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
    `previousAdjustment` DECIMAL(12, 2) NULL,
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
CREATE TABLE `Tariff` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tariffClassId` INTEGER NOT NULL,
    `month` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `rate` DECIMAL(12, 4) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Feeder` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Feeder_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Adjustment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `customerId` INTEGER NOT NULL,
    `adjustmentStartDate` DATETIME(3) NULL,
    `adjustmentEndDate` DATETIME(3) NULL,
    `adjustmentAmount` DECIMAL(12, 2) NULL,
    `balanceAfterAdjustment` DECIMAL(12, 2) NULL,
    `totalAmount` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdjustmentItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `adjustmentId` INTEGER NOT NULL,
    `month` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `consumption` DECIMAL(12, 2) NOT NULL,
    `tariff` DECIMAL(12, 2) NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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

-- AddForeignKey
ALTER TABLE `Customer` ADD CONSTRAINT `Customer_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CustomerDetails` ADD CONSTRAINT `CustomerDetails_tariffClassId_fkey` FOREIGN KEY (`tariffClassId`) REFERENCES `TariffClass`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CustomerDetails` ADD CONSTRAINT `CustomerDetails_feederId_fkey` FOREIGN KEY (`feederId`) REFERENCES `Feeder`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Consumption` ADD CONSTRAINT `Consumption_feederId_fkey` FOREIGN KEY (`feederId`) REFERENCES `Feeder`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tariff` ADD CONSTRAINT `Tariff_tariffClassId_fkey` FOREIGN KEY (`tariffClassId`) REFERENCES `TariffClass`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Adjustment` ADD CONSTRAINT `Adjustment_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdjustmentItem` ADD CONSTRAINT `AdjustmentItem_adjustmentId_fkey` FOREIGN KEY (`adjustmentId`) REFERENCES `Adjustment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
