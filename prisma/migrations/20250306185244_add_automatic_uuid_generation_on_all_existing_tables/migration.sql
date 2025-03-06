-- AlterTable
ALTER TABLE "account" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "sign_up_verification_code" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
