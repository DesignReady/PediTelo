import { NextRequest, NextResponse } from "next/server";
import { resetDB } from "@/lib/store";

// Endpoint temporal para reiniciar los datos de demo en Netlify Blobs.
// Se elimina después de usarlo una sola vez.
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { confirmar?: string };
  if (body.confirmar !== "REINICIAR") {
    return NextResponse.json({ error: "Confirmación inválida" }, { status: 400 });
  }
  try {
    const db = await resetDB();
    return NextResponse.json({ ok: true, hoteles: db.hotels.length });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 500 }
    );
  }
}
