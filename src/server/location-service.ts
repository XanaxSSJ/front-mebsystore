import { prisma } from "@/lib/prisma";

export async function validateUbigeo(department: string, province: string, district: string): Promise<void> {
  if (!department?.trim()) throw new Error("Department is required");
  if (!province?.trim()) throw new Error("Province is required");
  if (!district?.trim()) throw new Error("District is required");

  const row = await prisma.ubigeo.findFirst({
    where: { department, province, district },
  });
  if (!row) {
    throw new Error(
      `Invalid location combination: Department '${department}', Province '${province}', District '${district}'`,
    );
  }
}

export async function listDepartments(): Promise<string[]> {
  const rows = await prisma.$queryRaw<{ department: string }[]>`
    SELECT DISTINCT department FROM ubigeo ORDER BY department ASC
  `;
  return rows.map((r) => r.department);
}

export async function listProvinces(department: string): Promise<string[]> {
  if (!department?.trim()) return [];
  const rows = await prisma.$queryRaw<{ province: string }[]>`
    SELECT DISTINCT province FROM ubigeo WHERE department = ${department} ORDER BY province ASC
  `;
  return rows.map((r) => r.province);
}

export async function listDistricts(department: string, province: string): Promise<string[]> {
  if (!department?.trim() || !province?.trim()) return [];
  const rows = await prisma.$queryRaw<{ district: string }[]>`
    SELECT DISTINCT district FROM ubigeo
    WHERE department = ${department} AND province = ${province}
    ORDER BY district ASC
  `;
  return rows.map((r) => r.district);
}
