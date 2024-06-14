-- CreateTable
CREATE TABLE "sign_up_verification_code" (
    "id" TEXT NOT NULL,
    "code" CHAR(60) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "sign_up_verification_code_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "sign_up_verification_code" ADD CONSTRAINT "sign_up_verification_code_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
