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
];

const bySlug = new Map(paises.map((p) => [p.slug, p]));
const byMoneda = new Map(paises.map((p) => [p.moneda, p]));

export function paisBySlug(slug: string): Pais | undefined {
  return bySlug.get(slug);
}

export function paisByMoneda(iso: string): Pais | undefined {
  return byMoneda.get(iso);
}
