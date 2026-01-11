-- CreateTable
CREATE TABLE "boarddb.columns" (
    "id" TEXT NOT NULL,
    "board_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "position" DECIMAL(18,6) NOT NULL,

    CONSTRAINT "boarddb.columns_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_columns_board_id_position" ON "boarddb.columns"("board_id", "position");

-- AddForeignKey
ALTER TABLE "boarddb.columns" ADD CONSTRAINT "boarddb.columns_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "boarddb.boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
