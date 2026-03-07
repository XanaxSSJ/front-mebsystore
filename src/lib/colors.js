const COLOR_HEX = {
  rojo: '#DC2626', red: '#DC2626',
  verde: '#16A34A', green: '#16A34A',
  azul: '#2563EB', blue: '#2563EB',
  negro: '#171717', black: '#171717',
  blanco: '#FAFAFA', white: '#FAFAFA',
  amarillo: '#EAB308', yellow: '#EAB308',
  naranja: '#EA580C', orange: '#EA580C',
  gris: '#737373', gray: '#737373', grey: '#737373',
  'marrón': '#78350F', brown: '#78350F',
  beige: '#D4B896', ivory: '#FFFFF0', sand: '#C2B280',
  onyx: '#15173D', purple: '#982598', olive: '#556B2F',
  rosado: '#F472B6', pink: '#F472B6',
  celeste: '#38BDF8', cyan: '#06B6D4',
  morado: '#982598',
};

export function getColorHex(value) {
  if (!value || typeof value !== 'string') return '#E5E5E5';
  const key = value.trim().toLowerCase();
  return COLOR_HEX[key] ?? (key.startsWith('#') ? key : '#E5E5E5');
}
