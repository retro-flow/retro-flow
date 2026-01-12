-- CreateTable
CREATE TABLE "boarddb.cards" (
    "id" TEXT NOT NULL,
    "board_id" TEXT NOT NULL,
    "column_id" TEXT NOT NULL,
    "position" DECIMAL(18,6) NOT NULL,
    "text" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_login" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "boarddb.cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boarddb.card_likes" (
    "id" TEXT NOT NULL,
    "card_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "boarddb.card_likes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_cards_board_id_column_id_position" ON "boarddb.cards"("board_id", "column_id", "position");

-- CreateIndex
CREATE INDEX "idx_cards_author_id" ON "boarddb.cards"("user_id");

-- CreateIndex
CREATE INDEX "idx_card_likes_user" ON "boarddb.card_likes"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "ux_card_likes_card_user" ON "boarddb.card_likes"("card_id", "user_id");

-- AddForeignKey
ALTER TABLE "boarddb.cards" ADD CONSTRAINT "boarddb.cards_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "boarddb.boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boarddb.cards" ADD CONSTRAINT "boarddb.cards_column_id_fkey" FOREIGN KEY ("column_id") REFERENCES "boarddb.columns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boarddb.card_likes" ADD CONSTRAINT "boarddb.card_likes_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "boarddb.cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
