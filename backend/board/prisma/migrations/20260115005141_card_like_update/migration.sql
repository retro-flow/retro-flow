/*
  Warnings:

  - The primary key for the `boarddb.card_likes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `boarddb.card_likes` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "ux_card_likes_card_user";

-- AlterTable
ALTER TABLE "boarddb.card_likes" DROP CONSTRAINT "boarddb.card_likes_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "boarddb.card_likes_pkey" PRIMARY KEY ("card_id", "user_id");

-- CreateIndex
CREATE INDEX "idx_card_likes_card" ON "boarddb.card_likes"("card_id");
