-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('CCRO', 'CCO', 'CAO', 'MD') NOT NULL,
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
    `band` VARCHAR(191) NULL,
    `feederName` VARCHAR(191) NULL,
    `source` VARCHAR(191) NULL,
    `ticketNo` VARCHAR(191) NULL,
    `initialDebt` DECIMAL(12, 2) NULL,
    `adjustmentAmount` DECIMAL(12, 2) NULL,
    `balanceAfterAdjustment` DECIMAL(12, 2) NULL,
    `adjustmentStartDate` DATETIME(3) NULL,
    `adjustmentEndDate` DATETIME(3) NULL,
    `ccroremarks` VARCHAR(191) NULL,
    `ccoremarks` VARCHAR(191) NULL,
    `caoremarks` VARCHAR(191) NULL,
    `mdremarks` VARCHAR(191) NULL,
    `status` ENUM('Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Pending',
    `approvalStage` ENUM('CCRO', 'CCO', 'CAO', 'MD') NOT NULL DEFAULT 'CCO',
    `createdById` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Customer` ADD CONSTRAINT `Customer_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
