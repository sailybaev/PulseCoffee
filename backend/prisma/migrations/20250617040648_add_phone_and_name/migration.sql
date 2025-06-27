/*
  Warnings:

  - A unique constraint covering the columns `[phoneNumber]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNumber` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- First add the columns as nullable
ALTER TABLE "User" ADD COLUMN "name" TEXT,
ADD COLUMN "phoneNumber" TEXT;

-- Update existing records with default values
UPDATE "User" 
SET 
  "name" = 'User ' || id,
  "phoneNumber" = '+1000000000' || id;

-- Make the columns required
ALTER TABLE "User" ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "phoneNumber" SET NOT NULL;

-- Create unique index for phoneNumber
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");
