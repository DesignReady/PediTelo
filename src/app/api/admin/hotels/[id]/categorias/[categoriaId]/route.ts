import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { obtenerSesionDesdeRequest } from "@/lib/auth";

interface PatchCategoriaBody {
  nombre?: string;
  descripcion?: string;
  amenities?: string[];
  habitaciones?: { id?: string; numero?: string; disponible?: boolean }[];
  turnos?: { horas: number; precio?: number; activo?: boolean }[];
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; categoriaId: string }> }
) {
  const { id, categoriaId } = await params;

  const sesion = await obtenerSesionDesdeRequest(req);
  if (!sesion || sesion.hotelId !== id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as PatchCategoriaBody;

  try {
    const categoria = await prisma.$transaction(async (tx) => {
      const cat = await tx.categoria.findFirst({
        where: { id: categoriaId, hotelId: id },
        include: { habitaciones: true },
      });
      if (!cat) throw new Error("Categoría no encontrada");

      const data: Prisma.CategoriaUpdateInput = {};
      if (typeof body.nombre === "string" && body.nombre.trim()) data.nombre = body.nombre.trim();
      if (typeof body.descripcion === "string") data.descripcion = body.descripcion.trim();
      if (Array.isArray(body.amenities)) {
        data.amenities = body.amenities.map((a) => a.trim()).filter(Boolean);
      }
      if (Object.keys(data).length > 0) {
        await tx.categoria.update({ where: { id: categoriaId }, data });
      }

      if (Array.isArray(body.habitaciones)) {
        const existentesIds = new Set(cat.habitaciones.map((h) => h.id));
        const idsQueQuedan = new Set(
          body.habitaciones
            .map((h) => h.id)
            .filter((hid): hid is string => !!hid && existentesIds.has(hid))
        );
        const quitadasIds = cat.habitaciones
          .filter((h) => !idsQueQuedan.has(h.id))
          .map((h) => h.id);

        if (quitadasIds.length > 0) {
          const conReservaActiva = await tx.reserva.findFirst({
            where: { habitacionId: { in: quitadasIds }, estado: "activa" },
          });
          if (conReservaActiva) {
            throw new Error("No se puede quitar una habitación con una reserva activa");
          }
          await tx.habitacion.deleteMany({ where: { id: { in: quitadasIds } } });
        }

        for (const h of body.habitaciones) {
          const numero = h.numero?.trim() || "S/N";
          const disponible = h.disponible !== false;
          if (h.id && existentesIds.has(h.id)) {
            await tx.habitacion.update({ where: { id: h.id }, data: { numero, disponible } });
          } else {
            await tx.habitacion.create({ data: { categoriaId, numero, disponible } });
          }
        }
      }

      if (Array.isArray(body.turnos)) {
        for (const t of body.turnos) {
          const cambios: Prisma.TurnoUpdateManyMutationInput = {};
          if (typeof t.precio === "number" && t.precio >= 0) cambios.precio = Math.floor(t.precio);
          if (typeof t.activo === "boolean") cambios.activo = t.activo;
          if (Object.keys(cambios).length > 0) {
            await tx.turno.updateMany({ where: { categoriaId, horas: t.horas }, data: cambios });
          }
        }
      }

      return tx.categoria.findUnique({
        where: { id: categoriaId },
        include: {
          habitaciones: { orderBy: { numero: "asc" } },
          turnos: { orderBy: { horas: "asc" } },
        },
      });
    });

    return NextResponse.json({ categoria });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; categoriaId: string }> }
) {
  const { id, categoriaId } = await params;

  const sesion = await obtenerSesionDesdeRequest(req);
  if (!sesion || sesion.hotelId !== id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      const cat = await tx.categoria.findFirst({ where: { id: categoriaId, hotelId: id } });
      if (!cat) throw new Error("Categoría no encontrada");

      const activa = await tx.reserva.findFirst({ where: { categoriaId, estado: "activa" } });
      if (activa) {
        throw new Error("No se puede eliminar: tiene reservas activas en este momento");
      }

      await tx.categoria.delete({ where: { id: categoriaId } });
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 400 }
    );
  }
}
