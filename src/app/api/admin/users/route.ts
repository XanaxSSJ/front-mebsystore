import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";

export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json({
      message: "Lista de todos los usuarios",
      note: "Este endpoint solo es accesible para administradores",
    });
  } catch (e) {
    const status = typeof e === "object" && e !== null && "status" in e ? Number((e as { status: number }).status) : 500;
    if (status === 401) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error(e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
