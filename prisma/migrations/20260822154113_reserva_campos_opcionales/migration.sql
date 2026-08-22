-- DropForeignKey
ALTER TABLE "Reserva" DROP CONSTRAINT "Reserva_usuarioId_fkey";

-- AlterTable
ALTER TABLE "Reserva" ALTER COLUMN "usuarioId" DROP NOT NULL,
ALTER COLUMN "tipoPago" DROP NOT NULL,
ALTER COLUMN "montoPagado" DROP NOT NULL,
ALTER COLUMN "estado" SET DEFAULT 'activa';

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
