-- CreateEnum
CREATE TYPE "ReservaEstado" AS ENUM ('pendiente_pago', 'activa', 'finalizada', 'cancelada');

-- CreateEnum
CREATE TYPE "TipoPago" AS ENUM ('sena', 'parcial', 'total');

-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('pendiente', 'aprobado', 'rechazado');

-- CreateTable
CREATE TABLE "Hotel" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "zona" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL DEFAULT '',
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "telefono" TEXT NOT NULL,
    "colorDesde" TEXT NOT NULL,
    "colorHasta" TEXT NOT NULL,
    "amenitiesGenerales" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "reglas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "abierto" BOOLEAN NOT NULL DEFAULT true,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "mercadopagoAccessTokenCifrado" TEXT,
    "mercadopagoPublicKey" TEXT,
    "creada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Hotel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categoria" (
    "id" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL DEFAULT '',
    "amenities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "foto" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Habitacion" (
    "id" TEXT NOT NULL,
    "categoriaId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "disponible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Habitacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Turno" (
    "id" TEXT NOT NULL,
    "categoriaId" TEXT NOT NULL,
    "horas" INTEGER NOT NULL,
    "precio" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Turno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "googleId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "fotoUrl" TEXT,
    "telefono" TEXT,
    "creada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reserva" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "categoriaId" TEXT NOT NULL,
    "habitacionId" TEXT,
    "usuarioId" TEXT NOT NULL,
    "clienteNombre" TEXT NOT NULL,
    "clienteTelefono" TEXT NOT NULL,
    "turnoHoras" INTEGER NOT NULL,
    "precio" INTEGER NOT NULL,
    "tipoPago" "TipoPago" NOT NULL,
    "montoPagado" INTEGER NOT NULL,
    "estadoPago" "EstadoPago" NOT NULL DEFAULT 'pendiente',
    "mpPreferenceId" TEXT,
    "mpPaymentId" TEXT,
    "inicio" TIMESTAMP(3),
    "fin" TIMESTAMP(3),
    "estado" "ReservaEstado" NOT NULL DEFAULT 'pendiente_pago',
    "creada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reserva_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comentario" (
    "id" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "calificacion" INTEGER NOT NULL,
    "comentario" TEXT NOT NULL,
    "creada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comentario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CuentaHotel" (
    "id" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "creada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CuentaHotel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Hotel_slug_key" ON "Hotel"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Turno_categoriaId_horas_key" ON "Turno"("categoriaId", "horas");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_googleId_key" ON "Usuario"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Reserva_codigo_key" ON "Reserva"("codigo");

-- CreateIndex
CREATE INDEX "Reserva_hotelId_estado_idx" ON "Reserva"("hotelId", "estado");

-- CreateIndex
CREATE UNIQUE INDEX "CuentaHotel_hotelId_key" ON "CuentaHotel"("hotelId");

-- CreateIndex
CREATE UNIQUE INDEX "CuentaHotel_email_key" ON "CuentaHotel"("email");

-- AddForeignKey
ALTER TABLE "Categoria" ADD CONSTRAINT "Categoria_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Habitacion" ADD CONSTRAINT "Habitacion_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turno" ADD CONSTRAINT "Turno_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_habitacionId_fkey" FOREIGN KEY ("habitacionId") REFERENCES "Habitacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comentario" ADD CONSTRAINT "Comentario_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CuentaHotel" ADD CONSTRAINT "CuentaHotel_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
