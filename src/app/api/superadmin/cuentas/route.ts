import { NextRequest, NextResponse } from "next/server";
import { esSuperadminDesdeRequest, generarPasswordLegible, hashPassword } from "@/lib/auth";
import { generarId, mutateDB } from "@/lib/store";

interface CrearCuentaBody {
  hotelId?: string;
  email?: string;
}

export async function POST(req: NextRequest) {
  if (!(await esSuperadminDesdeRequest(req))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as CrearCuentaBody;
  const email = body.email?.trim().toLowerCase();
  if (!body.hotelId || !email) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const passwordNueva = generarPasswordLegible();
  const passwordHash = await hashPassword(passwordNueva);

  try {
    await mutateDB((db) => {
      const hotel = db.hotels.find((h) => h.id === body.hotelId);
      if (!hotel) throw new Error("Hotel no encontrado");

      const existente = db.cuentas.find((c) => c.hotelId === body.hotelId);
      if (existente) {
        existente.email = email;
        existente.passwordHash = passwordHash;
      } else {
        db.cuentas.push({
          id: generarId("cuenta"),
          hotelId: body.hotelId!,
          email,
          passwordHash,
          creada: new Date().toISOString(),
        });
      }
    });

    return NextResponse.json({ email, password: passwordNueva });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 400 }
    );
  }
}
