/*
  Warnings:

  - You are about to drop the column `total_score` on the `Form` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Form" DROP COLUMN "total_score",
ADD COLUMN     "bdi_score" TEXT;
