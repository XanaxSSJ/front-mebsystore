import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { listDepartments } from "@/server/location-service";

export async function GET() {
  try {
    await requireSession();
    const data = await listDepartments();
    return NextResponse.json(data);
  } catch (e) {
    const status = typeof e === "object" && e !== null && "status" in e ? Number((e as { status: number }).status) : 500;
    if (status === 401) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
