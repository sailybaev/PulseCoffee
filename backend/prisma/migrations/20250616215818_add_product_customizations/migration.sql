-- CreateEnum
CREATE TYPE "CustomizationType" AS ENUM ('CUP_SIZE', 'MILK_TYPE', 'SYRUP', 'EXTRA_SHOT', 'TEMPERATURE', 'OTHER');

-- CreateTable
CREATE TABLE "ProductCustomization" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "type" "CustomizationType" NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductCustomization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItemCustomization" (
    "id" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "productCustomizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderItemCustomization_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductCustomization_productId_type_name_key" ON "ProductCustomization"("productId", "type", "name");

-- AddForeignKey
ALTER TABLE "ProductCustomization" ADD CONSTRAINT "ProductCustomization_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemCustomization" ADD CONSTRAINT "OrderItemCustomization_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemCustomization" ADD CONSTRAINT "OrderItemCustomization_productCustomizationId_fkey" FOREIGN KEY ("productCustomizationId") REFERENCES "ProductCustomization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
