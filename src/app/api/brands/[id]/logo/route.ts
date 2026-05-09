import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { uploadImageBuffer } from "@/server/cloudinary";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    const form = await req.formData();
    const file = form.get("file");
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }
    const buf = Buffer.from(await file.arrayBuffer());
    const url = await uploadImageBuffer(buf);
    const updated = await prisma.brand.update({
      where: { id },
      data: { logoUrl: url },
    });
    const o: Record<string, unknown> = {
      id: updated.id,
      name: updated.name,
      active: updated.active,
      createdAt: updated.createdAt.toISOString(),
      slug: updated.slug,
    };
    if (updated.logoUrl) o.logoUrl = updated.logoUrl;
    return NextResponse.json(o);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    const status = typeof e === "object" && e !== null && "status" in e ? Number((e as { status: number }).status) : 500;
    if (status === 401) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (msg.includes("Record to update not found")) {
      return NextResponse.json({ error: "Brand not found" }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
