export interface Moneda {
  slug: string;
  iso: string;
  nombre: string;
  paisSlug: string;
}

export const monedas: Moneda[] = [
  { slug: 'peso-chileno',    iso: 'CLP', nombre: 'peso chileno',    paisSlug: 'chile' },
  { slug: 'peso-mexicano',   iso: 'MXN', nombre: 'peso mexicano',   paisSlug: 'mexico' },
  { slug: 'sol-peruano',     iso: 'PEN', nombre: 'sol peruano',     paisSlug: 'peru' },
  { slug: 'peso-colombiano', iso: 'COP', nombre: 'peso colombiano', paisSlug: 'colombia' },
  { slug: 'peso-argentino',  iso: 'ARS', nombre: 'peso argentino',  paisSlug: 'argentina' },
  { slug: 'euro',            iso: 'EUR', nombre: 'euro',            paisSlug: 'espana' },
];

const bySlug = new Map(monedas.map((m) => [m.slug, m]));

export function monedaBySlug(slug: string): Moneda | undefined {
  return bySlug.get(slug);
}
