import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { listDistricts } from "@/server/location-service";

export async function GET(req: Request) {
  try {
    await requireSession();
    const url = new URL(req.url);
    const department = url.searchParams.get("department") ?? "";
    const province = url.searchParams.get("province") ?? "";
    const data = await listDistricts(department, province);
    return NextResponse.json(data);
  } catch (e) {
    const status = typeof e === "object" && e !== null && "status" in e ? Number((e as { status: number }).status) : 500;
    if (status === 401) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
