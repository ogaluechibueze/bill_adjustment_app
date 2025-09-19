/*
  Warnings:

  - A unique constraint covering the columns `[globalAcctNo]` on the table `CustomerDetails` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `customerdetails` MODIFY `globalAcctNo` VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `idx_global_acct_no` ON `CustomerDetails`(`globalAcctNo`);
