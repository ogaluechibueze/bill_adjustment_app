/*
  Warnings:

  - Added the required column `region` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `region` VARCHAR(191) NOT NULL,
    MODIFY `role` ENUM('CCRO', 'HCC', 'BM', 'RH', 'RA', 'IA', 'CIA', 'MD', 'ADMIN') NOT NULL;
