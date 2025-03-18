-- CreateTable
CREATE TABLE "uploaded_file" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "key" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "original_name" VARCHAR(255) NOT NULL,
    "extension" VARCHAR(10) NOT NULL,
    "owner" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "uploaded_file_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "uploaded_file_key_key" ON "uploaded_file"("key");

-- AddForeignKey
ALTER TABLE "uploaded_file" ADD CONSTRAINT "uploaded_file_owner_fkey" FOREIGN KEY ("owner") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
