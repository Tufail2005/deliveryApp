/*
  Warnings:

  - The `name` column on the `Category` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ItemCategory" AS ENUM ('NORTH_INDIAN', 'SOUTH_INDIAN', 'CHINESE', 'ITALIAN', 'ASIAN', 'BIRYANI', 'BURGER', 'PIZZA', 'MOMO', 'ROLLS', 'DOSA', 'THALI', 'CHICKEN', 'MUTTON', 'FISH', 'PANEER', 'DAL', 'PARATHA', 'SANDWICH', 'CHAAT', 'SNACKS', 'DESSERTS', 'CAKE', 'ICE_CREAM', 'BEVERAGES', 'SALAD_BOWL', 'OTHERS');

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "name",
ADD COLUMN     "name" "ItemCategory" NOT NULL DEFAULT 'OTHERS';

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_restaurantId_key" ON "Category"("name", "restaurantId");
