import { NextRequest, NextResponse } from "next/server";
import { mutateDB } from "@/lib/store";
import { borrarImagen, guardarImagen, urlImagen } from "@/lib/uploads";

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
    const categoria = await mutateDB((db) => {
      const hotel = db.hotels.find((h) => h.id === id);
      if (!hotel) throw new Error("Hotel no encontrado");
      const cat = hotel.categorias.find((c) => c.id === categoriaId);
      if (!cat) throw new Error("Categoría no encontrada");

      const fotoAnterior = cat.foto;
      cat.foto = rutaPublica;

      if (fotoAnterior && fotoAnterior.startsWith("/api/uploads/")) {
        borrarImagen(fotoAnterior.replace("/api/uploads/", ""));
      }

      return cat;
    });

    return NextResponse.json({ categoria });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 400 }
    );
  }
}
