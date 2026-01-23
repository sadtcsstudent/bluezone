-- AlterTable
ALTER TABLE "Initiative" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ALTER COLUMN "coordinateX" DROP NOT NULL,
ALTER COLUMN "coordinateY" DROP NOT NULL;

-- CreateTable
CREATE TABLE "I18nKey" (
    "key" TEXT NOT NULL,
    "format" TEXT NOT NULL DEFAULT 'plain',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "I18nKey_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "I18nOverride" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "I18nOverride_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "I18nOverride_locale_idx" ON "I18nOverride"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "I18nOverride_key_locale_key" ON "I18nOverride"("key", "locale");

-- AddForeignKey
ALTER TABLE "I18nOverride" ADD CONSTRAINT "I18nOverride_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "I18nOverride" ADD CONSTRAINT "I18nOverride_key_fkey" FOREIGN KEY ("key") REFERENCES "I18nKey"("key") ON DELETE CASCADE ON UPDATE CASCADE;
