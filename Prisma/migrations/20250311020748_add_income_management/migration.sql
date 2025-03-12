/*
  Warnings:

  - Made the column `incomeSourceId` on table `IncomeTransaction` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "IncomeTransaction" DROP CONSTRAINT "IncomeTransaction_incomeSourceId_fkey";

-- DropIndex
DROP INDEX "IncomeSource_userId_idx";

-- DropIndex
DROP INDEX "IncomeTransaction_incomeSourceId_idx";

-- DropIndex
DROP INDEX "IncomeTransaction_userId_idx";

-- AlterTable
ALTER TABLE "IncomeTransaction" ALTER COLUMN "incomeSourceId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "IncomeTransaction" ADD CONSTRAINT "IncomeTransaction_incomeSourceId_fkey" FOREIGN KEY ("incomeSourceId") REFERENCES "IncomeSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
