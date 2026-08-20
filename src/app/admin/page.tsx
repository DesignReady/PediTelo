import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_SESION, verificarTokenSesion } from "@/lib/auth";
import AdminClient from "@/components/admin/AdminClient";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_SESION)?.value;
  const sesion = token ? await verificarTokenSesion(token) : null;

  if (!sesion) {
    redirect("/admin/login");
  }

  return <AdminClient hotelId={sesion.hotelId} />;
}
