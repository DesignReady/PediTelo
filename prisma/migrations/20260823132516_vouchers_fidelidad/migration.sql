-- AlterTable
ALTER TABLE "Reserva" ADD COLUMN     "voucherId" TEXT;

-- CreateTable
CREATE TABLE "Voucher" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "usado" BOOLEAN NOT NULL DEFAULT false,
    "usadoEn" TIMESTAMP(3),
    "creada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Voucher_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Voucher_codigo_key" ON "Voucher"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Reserva_voucherId_key" ON "Reserva"("voucherId");

-- AddForeignKey
ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

