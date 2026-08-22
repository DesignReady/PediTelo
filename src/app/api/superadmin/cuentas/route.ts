import { NextRequest, NextResponse } from "next/server";
import { esSuperadminDesdeRequest, generarPasswordLegible, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Nunca cachear: siempre lee/escribe datos en vivo contra la base.
export const dynamic = "force-dynamic";

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
    const hotel = await prisma.hotel.findUnique({ where: { id: body.hotelId }, select: { id: true } });
    if (!hotel) throw new Error("Hotel no encontrado");

    await prisma.cuentaHotel.upsert({
      where: { hotelId: body.hotelId },
      update: { email, passwordHash },
      create: { hotelId: body.hotelId, email, passwordHash },
    });

    return NextResponse.json({ email, password: passwordNueva });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 400 }
    );
  }
}
