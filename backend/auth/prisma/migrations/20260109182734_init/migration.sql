-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "citext";

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('USER', 'GUEST');

-- CreateTable
CREATE TABLE "authdb.users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" "UserType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "authdb.users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "authdb.profiles" (
    "user_id" UUID NOT NULL,
    "email" CITEXT NOT NULL,
    "login" TEXT NOT NULL,

    CONSTRAINT "authdb.profiles_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "authdb.passwords" (
    "user_id" UUID NOT NULL,
    "password_hash" TEXT NOT NULL,

    CONSTRAINT "authdb.passwords_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "authdb.profiles_email_key" ON "authdb.profiles"("email");

-- AddForeignKey
ALTER TABLE "authdb.profiles" ADD CONSTRAINT "authdb.profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "authdb.users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "authdb.passwords" ADD CONSTRAINT "authdb.passwords_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "authdb.users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
