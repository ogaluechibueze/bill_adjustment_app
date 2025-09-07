-- CreateTable
CREATE TABLE `Adjustment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `customerId` INTEGER NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `totalAmount` DECIMAL(12, 2) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdjustmentItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `adjustmentId` INTEGER NOT NULL,
    `month` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `consumption` DECIMAL(12, 2) NOT NULL,
    `tariffRate` DECIMAL(12, 4) NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Adjustment` ADD CONSTRAINT `Adjustment_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdjustmentItem` ADD CONSTRAINT `AdjustmentItem_adjustmentId_fkey` FOREIGN KEY (`adjustmentId`) REFERENCES `Adjustment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
