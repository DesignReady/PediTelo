-- DropForeignKey
ALTER TABLE "Reserva" DROP CONSTRAINT "Reserva_categoriaId_fkey";

-- AlterTable
ALTER TABLE "Reserva" ALTER COLUMN "categoriaId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;
