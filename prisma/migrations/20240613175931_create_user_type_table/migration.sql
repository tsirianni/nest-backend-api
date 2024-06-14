-- CreateTable
CREATE TABLE "user_type" (
    "id" SMALLINT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "user_type_pkey" PRIMARY KEY ("id")
);
