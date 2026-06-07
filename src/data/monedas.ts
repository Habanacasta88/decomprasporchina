export interface Moneda {
  slug: string;
  iso: string;
  nombre: string;
  paisSlug: string;
}

export const monedas: Moneda[] = [
  // 6 originales
  { slug: 'peso-chileno',    iso: 'CLP', nombre: 'peso chileno',    paisSlug: 'chile' },
  { slug: 'peso-mexicano',   iso: 'MXN', nombre: 'peso mexicano',   paisSlug: 'mexico' },
  { slug: 'sol-peruano',     iso: 'PEN', nombre: 'sol peruano',     paisSlug: 'peru' },
  { slug: 'peso-colombiano', iso: 'COP', nombre: 'peso colombiano', paisSlug: 'colombia' },
  { slug: 'peso-argentino',  iso: 'ARS', nombre: 'peso argentino',  paisSlug: 'argentina' },
  { slug: 'euro',            iso: 'EUR', nombre: 'euro',            paisSlug: 'espana' },
  // 7 nuevas (LATAM secundarios)
  { slug: 'dolar',                 iso: 'USD', nombre: 'dólar estadounidense', paisSlug: 'ecuador' },
  { slug: 'bolivar-venezolano',    iso: 'VES', nombre: 'bolívar venezolano',   paisSlug: 'venezuela' },
  { slug: 'quetzal',               iso: 'GTQ', nombre: 'quetzal guatemalteco', paisSlug: 'guatemala' },
  { slug: 'colon-costarricense',   iso: 'CRC', nombre: 'colón costarricense',  paisSlug: 'costa-rica' },
  { slug: 'peso-uruguayo',         iso: 'UYU', nombre: 'peso uruguayo',        paisSlug: 'uruguay' },
  { slug: 'boliviano',             iso: 'BOB', nombre: 'boliviano',            paisSlug: 'bolivia' },
  { slug: 'peso-dominicano',       iso: 'DOP', nombre: 'peso dominicano',      paisSlug: 'republica-dominicana' },
];

const bySlug = new Map(monedas.map((m) => [m.slug, m]));

export function monedaBySlug(slug: string): Moneda | undefined {
  return bySlug.get(slug);
}
