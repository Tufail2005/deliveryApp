/*
  Warnings:

  - You are about to drop the column `restaurantId` on the `DeliverySlab` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `MenuItem` table. All the data in the column will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_restaurantId_fkey";

-- DropForeignKey
ALTER TABLE "DeliverySlab" DROP CONSTRAINT "DeliverySlab_restaurantId_fkey";

-- DropForeignKey
ALTER TABLE "MenuItem" DROP CONSTRAINT "MenuItem_categoryId_fkey";

-- AlterTable
ALTER TABLE "DeliverySlab" DROP COLUMN "restaurantId";

-- AlterTable
ALTER TABLE "MenuItem" DROP COLUMN "categoryId",
ADD COLUMN     "category" "ItemCategory" NOT NULL DEFAULT 'OTHERS';

-- DropTable
DROP TABLE "Category";
