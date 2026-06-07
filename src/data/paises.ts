export interface Pais {
  slug: string;
  nombre: string;
  gentilicio: string;
  moneda: string;
  simbolo: string;
  hreflang: string;
  prioridad: number;
}

export const paises: Pais[] = [
  { slug: 'chile',     nombre: 'Chile',     gentilicio: 'chilena',     moneda: 'CLP', simbolo: '$',  hreflang: 'es-CL', prioridad: 1 },
  { slug: 'mexico',    nombre: 'México',    gentilicio: 'mexicana',    moneda: 'MXN', simbolo: '$',  hreflang: 'es-MX', prioridad: 2 },
  { slug: 'peru',      nombre: 'Perú',      gentilicio: 'peruana',     moneda: 'PEN', simbolo: 'S/', hreflang: 'es-PE', prioridad: 3 },
  { slug: 'colombia',  nombre: 'Colombia',  gentilicio: 'colombiana',  moneda: 'COP', simbolo: '$',  hreflang: 'es-CO', prioridad: 4 },
  { slug: 'argentina', nombre: 'Argentina', gentilicio: 'argentina',   moneda: 'ARS', simbolo: '$',  hreflang: 'es-AR', prioridad: 5 },
  { slug: 'espana',    nombre: 'España',    gentilicio: 'española',    moneda: 'EUR', simbolo: '€',  hreflang: 'es-ES', prioridad: 6 },
  { slug: 'ecuador',              nombre: 'Ecuador',              gentilicio: 'ecuatoriana',   moneda: 'USD', simbolo: '$',  hreflang: 'es-EC', prioridad: 7 },
  { slug: 'venezuela',            nombre: 'Venezuela',            gentilicio: 'venezolana',    moneda: 'VES', simbolo: 'Bs.', hreflang: 'es-VE', prioridad: 8 },
  { slug: 'panama',               nombre: 'Panamá',               gentilicio: 'panameña',      moneda: 'USD', simbolo: '$',  hreflang: 'es-PA', prioridad: 9 },
  { slug: 'guatemala',            nombre: 'Guatemala',            gentilicio: 'guatemalteca',  moneda: 'GTQ', simbolo: 'Q',  hreflang: 'es-GT', prioridad: 10 },
  { slug: 'costa-rica',           nombre: 'Costa Rica',           gentilicio: 'costarricense', moneda: 'CRC', simbolo: '₡',  hreflang: 'es-CR', prioridad: 11 },
  { slug: 'uruguay',              nombre: 'Uruguay',              gentilicio: 'uruguaya',      moneda: 'UYU', simbolo: '$',  hreflang: 'es-UY', prioridad: 12 },
  { slug: 'bolivia',              nombre: 'Bolivia',              gentilicio: 'boliviana',     moneda: 'BOB', simbolo: 'Bs.', hreflang: 'es-BO', prioridad: 13 },
  { slug: 'republica-dominicana', nombre: 'República Dominicana', gentilicio: 'dominicana',    moneda: 'DOP', simbolo: 'RD$', hreflang: 'es-DO', prioridad: 14 },
  { slug: 'el-salvador',          nombre: 'El Salvador',          gentilicio: 'salvadoreña',   moneda: 'USD', simbolo: '$',  hreflang: 'es-SV', prioridad: 15 },
];

const bySlug = new Map(paises.map((p) => [p.slug, p]));
const byMoneda = new Map(paises.map((p) => [p.moneda, p]));

export function paisBySlug(slug: string): Pais | undefined {
  return bySlug.get(slug);
}

export function paisByMoneda(iso: string): Pais | undefined {
  return byMoneda.get(iso);
}
