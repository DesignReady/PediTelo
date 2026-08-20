import { NextRequest, NextResponse } from "next/server";
import { leerImagen } from "@/lib/uploads";

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  if (filename.includes("/") || filename.includes("..")) {
    return NextResponse.json({ error: "Nombre de archivo inválido" }, { status: 400 });
  }

  try {
    const buffer = await leerImagen(filename);
    if (!buffer) {
      return NextResponse.json({ error: "Imagen no encontrada" }, { status: 404 });
    }

    const ext = filename.split(".").pop()?.toLowerCase() ?? "";
    const contentType = CONTENT_TYPES[ext] ?? "application/octet-stream";

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (e) {
    console.error("GET /api/uploads/[filename]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error interno" },
      { status: 500 }
    );
  }
}
