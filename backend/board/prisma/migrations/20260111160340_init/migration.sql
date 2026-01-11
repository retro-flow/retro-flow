-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "citext";

-- CreateEnum
CREATE TYPE "invite_type" AS ENUM ('TEMPORARY', 'PERMANENT');

-- CreateTable
CREATE TABLE "boarddb.boards" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "seq" INTEGER NOT NULL DEFAULT 0,
    "owner_user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "boarddb.boards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boarddb.board_invites" (
    "board_id" TEXT NOT NULL,
    "type" "invite_type" NOT NULL,
    "token_hash" BYTEA NOT NULL,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "boarddb.board_invites_pkey" PRIMARY KEY ("board_id","type")
);

-- CreateIndex
CREATE INDEX "idx_boards_owner_user_id" ON "boarddb.boards"("owner_user_id");

-- CreateIndex
CREATE INDEX "idx_board_invites_expires_at" ON "boarddb.board_invites"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "ux_board_invites_token_hash" ON "boarddb.board_invites"("token_hash");

-- AddForeignKey
ALTER TABLE "boarddb.board_invites" ADD CONSTRAINT "boarddb.board_invites_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "boarddb.boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
