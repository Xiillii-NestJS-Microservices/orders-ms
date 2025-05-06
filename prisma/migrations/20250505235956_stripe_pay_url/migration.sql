/*
  Warnings:

  - Added the required column `receiptUrl` to the `OrderReceipt` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrderReceipt" ADD COLUMN     "receiptUrl" TEXT NOT NULL;
