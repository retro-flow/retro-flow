-- CreateTable
CREATE TABLE "boarddb.board_members" (
    "id" TEXT NOT NULL,
    "board_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "boarddb.board_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_board_members_user" ON "boarddb.board_members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "ux_board_members_board_user" ON "boarddb.board_members"("board_id", "user_id");

-- AddForeignKey
ALTER TABLE "boarddb.board_members" ADD CONSTRAINT "boarddb.board_members_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "boarddb.boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
