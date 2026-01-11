/*
  Warnings:

  - You are about to drop the column `token_hash` on the `boarddb.board_invites` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[token]` on the table `boarddb.board_invites` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `token` to the `boarddb.board_invites` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ux_board_invites_token_hash";

-- AlterTable
ALTER TABLE "boarddb.board_invites" DROP COLUMN "token_hash",
ADD COLUMN     "token" VARCHAR(64) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ux_board_invites_token" ON "boarddb.board_invites"("token");
