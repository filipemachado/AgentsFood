-- AlterTable
ALTER TABLE "conversations" ADD COLUMN     "currentContext" JSONB,
ADD COLUMN     "currentOrder" JSONB,
ADD COLUMN     "preferences" JSONB;
