/** Normaliza params de `useParams()` de Next.js a un string. */
export function getRouteParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}
