import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await requireAdmin();
    return NextResponse.json({
      message: "Bienvenido al panel de administración",
      user: session.email,
      roles: session.roles,
      timestamp: Date.now(),
    });
  } catch (e) {
    const status = typeof e === "object" && e !== null && "status" in e ? Number((e as { status: number }).status) : 500;
    if (status === 401) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error(e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
