/*
  Warnings:

  - Added the required column `user_login` to the `boarddb.card_likes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "boarddb.card_likes" ADD COLUMN     "user_login" TEXT NOT NULL;
