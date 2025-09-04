/*
  Warnings:

  - You are about to drop the column `airemarks` on the `customer` table. All the data in the column will be lost.
  - Added the required column `bussinessUnit` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `customer` DROP COLUMN `airemarks`,
    ADD COLUMN `iaremarks` VARCHAR(191) NULL,
    MODIFY `approvalStage` ENUM('CCRO', 'HCC', 'BM', 'RH', 'RA', 'IA', 'CIA', 'MD') NOT NULL DEFAULT 'HCC';

-- AlterTable
ALTER TABLE `user` ADD COLUMN `bussinessUnit` VARCHAR(191) NOT NULL;
