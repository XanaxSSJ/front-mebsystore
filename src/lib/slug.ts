export function generateSlug(input: string): string {
  if (input == null) throw new Error("Value cannot be null for slug generation");
  return input
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}
