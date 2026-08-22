import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { borrarImagen, guardarImagen, urlImagen } from "@/lib/uploads";
import { obtenerSesionDesdeRequest } from "@/lib/auth";

// Nunca cachear: siempre lee/escribe datos en vivo contra la base.
export const dynamic = "force-dynamic";

const TIPOS_PERMITIDOS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; categoriaId: string }> }
) {
  const { id, categoriaId } = await params;

  const sesion = await obtenerSesionDesdeRequest(req);
  if (!sesion || sesion.hotelId !== id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("foto");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No se recibió ninguna imagen" }, { status: 400 });
  }
  const ext = TIPOS_PERMITIDOS[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: "Formato no soportado. Usá JPG, PNG, WEBP o GIF." },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "La imagen no puede superar los 5MB" }, { status: 400 });
  }

  const filename = `${categoriaId}-${Date.now()}.${ext}`;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    await guardarImagen(filename, buffer);
  } catch {
    return NextResponse.json(
      { error: "El servidor no permite guardar imágenes en este entorno de hosting" },
      { status: 500 }
    );
  }
  const rutaPublica = urlImagen(filename);

  try {
    const anterior = await prisma.categoria.findFirst({
      where: { id: categoriaId, hotelId: id },
      select: { foto: true },
    });
    if (!anterior) throw new Error("Categoría no encontrada");

    const categoria = await prisma.categoria.update({
      where: { id: categoriaId },
      data: { foto: rutaPublica },
    });

    if (anterior.foto && anterior.foto.startsWith("/api/uploads/")) {
      borrarImagen(anterior.foto.replace("/api/uploads/", ""));
    }

    return NextResponse.json({ categoria });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 400 }
    );
  }
}
