export type Base = 'CIF' | 'FOB';

export interface ReglaAduana {
  pais: string;              // slug, FK a paises.ts
  moneda: string;            // ISO local
  baseCalculo: Base;
  /**
   * deMinimisUSD = umbral del valor de la mercancía (FOB o valor del bien según país)
   * por debajo del cual NO se cobra (al menos parte de) los tributos. null = no aplica
   * minimis en el sentido tradicional.
   */
  deMinimisUSD: number | null;
  ivaPct: number;            // IVA/IGV general aplicable
  arancelGeneralPct: number; // arancel general orientativo para China
  notas: string[];
  fuenteUrl: string;
  fuenteNombre: string;
  fechaRevision: string;     // YYYY-MM-DD
  confianza: 'alta' | 'media';
  algoritmoEspecial?: 'mexico-tasa-global' | 'argentina-franquicia-courier';
  /**
   * Solo España (UE Reglamento 2026/382): a partir de `vigenteDesde`, los envíos
   * con valor ≤ `aplicaHastaValorEUR` pagan `eurPorLinea` EUR fijos como arancel
   * adicional al IVA.
   */
  arancelFijoUE2026?: {
    eurPorLinea: number;
    vigenteDesde: string;        // YYYY-MM-DD
    aplicaHastaValorEUR: number;
  };
}

export const reglas: ReglaAduana[] = [
  {
    pais: 'chile',
    moneda: 'CLP',
    baseCalculo: 'CIF',
    deMinimisUSD: 0, // Ley 21.713 eliminó la franquicia US$41
    ivaPct: 19,
    arancelGeneralPct: 6, // se aplica SOBRE US$500
    notas: [
      'Ley 21.713 vigente desde 25-oct-2025: todas las compras pagan IVA 19% desde el primer peso',
      'Hasta US$500 de valor del bien: solo IVA 19%, sin arancel ad valorem',
      'Sobre US$500: IVA 19% sobre (CIF + arancel), más 6% de arancel ad valorem sobre CIF',
      'AliExpress, Temu, Shein, Amazon y otras 5 plataformas están registradas en SII y cobran el IVA en el checkout — al recibir en Chile NO pagas nada más',
      'Si la plataforma NO está registrada en SII, el IVA se paga al recibir con Formulario 18 o en CorreosChile',
      'Despacho simplificado disponible hasta US$3.000',
    ],
    fuenteUrl: 'https://www.aduana.cl/compras-online-internacionales-iva-se-pagara-en-las-plataformas-y/aduana/2025-10-06/100335.html',
    fuenteNombre: 'Servicio Nacional de Aduanas de Chile',
    fechaRevision: '2026-06-07',
    confianza: 'alta',
  },
  {
    pais: 'mexico',
    moneda: 'MXN',
    baseCalculo: 'CIF',
    deMinimisUSD: 0,
    ivaPct: 16,
    arancelGeneralPct: 33.5, // tasa global única que reemplaza IGI+IVA+DTA en régimen simplificado
    algoritmoEspecial: 'mexico-tasa-global',
    notas: [
      'Para China NO existe de minimis: aplica la tasa global 33.5% desde el primer dólar bajo régimen simplificado courier (Regla 3.7.35 RGCE)',
      'La tasa 33.5% YA INCLUYE IGI + IVA + DTA — no se suma 16% IVA por separado',
      'Aplica hasta US$2.500 por destinatario. Sobre eso requiere despacho formal con agente aduanal',
      'Cambio mayor 15-ago-2025: la tasa subió de 19% a 33.5% para países sin TLC con México (4ª RM RGCE 2025, DOF 28-jul-2025)',
      'Si la plataforma (Shein/Temu/AliExpress) está registrada ante SAT, retiene IVA en origen — verificar al hacer la compra',
      'La calculadora muestra una ESTIMACIÓN del régimen simplificado courier; el pago real puede variar si aplica IEPS o NOMs',
    ],
    fuenteUrl: 'https://www.anam.gob.mx/mensajeria-y-paqueteria/',
    fuenteNombre: 'ANAM (Agencia Nacional de Aduanas de México)',
    fechaRevision: '2026-06-07',
    confianza: 'media',
  },
  {
    pais: 'peru',
    moneda: 'PEN',
    baseCalculo: 'CIF',
    deMinimisUSD: 200, // FOB
    ivaPct: 18,        // IGV 16% + IPM 2%
    arancelGeneralPct: 4, // courier Cat 3, sobre CIF
    notas: [
      'Umbral US$200 FOB exento de aranceles e IGV en régimen courier (Cat 2 DS 192-2020-EF) e Importa Fácil (postal)',
      'De US$200.01 a US$2.000 FOB: courier Cat 3 paga 4% ad valorem sobre CIF + 18% IGV sobre (CIF + arancel)',
      'Sobre US$2.000 FOB: despacho regular (no contemplado en esta calculadora)',
      'Base FOB para medir el umbral, base CIF para calcular los tributos cuando aplican',
      'SUNAT vigila el fraccionamiento: múltiples envíos al mismo destinatario en el mismo manifiesto pueden consolidarse',
      'Sin cambios al umbral US$200 ni a las tasas 4%/18% en 2024-2026',
    ],
    fuenteUrl: 'https://www.sunat.gob.pe/orientacionaduanera/enviospostales/clasificaEP.html',
    fuenteNombre: 'SUNAT (Superintendencia Nacional de Aduanas y de Administración Tributaria)',
    fechaRevision: '2026-06-07',
    confianza: 'alta',
  },
  {
    pais: 'colombia',
    moneda: 'COP',
    baseCalculo: 'FOB',
    deMinimisUSD: 200, // FOB, solo para arancel
    ivaPct: 19,
    arancelGeneralPct: 10,
    notas: [
      'Umbral US$200 FOB exento de ARANCEL para todos los orígenes (Decreto 1165 de 2019)',
      'IVA 19%: por ser China sin TLC, aplica IVA SIEMPRE incluso bajo US$200 (Ley 2155 de 2021 art. 428 lit. j solo exime EE.UU.)',
      'De US$200 a US$2.000 FOB: arancel 10% sobre FOB + IVA 19% sobre (FOB + arancel)',
      'Tope absoluto: US$2.000 valor, 50 kg, sin fines comerciales',
      'CAMBIO REVERTIDO: el Decreto 1474/2025 redujo el umbral a US$50 entre ene-abr 2026; la Corte Constitucional lo declaró inexequible el 9-abr-2026, volvió a US$200',
      'Convenio DDP de 4-72 con AliExpress/Shein/Temu: el IVA puede estar pagado en el checkout — verifica al comprar',
    ],
    fuenteUrl: 'https://www.dian.gov.co/Viajeros-y-Servicios-aduaneros/Paginas/Modalidad-de-trafico-postal-y-envios-urgentes.aspx',
    fuenteNombre: 'DIAN (Dirección de Impuestos y Aduanas Nacionales)',
    fechaRevision: '2026-06-07',
    confianza: 'alta',
  },
  {
    pais: 'argentina',
    moneda: 'ARS',
    baseCalculo: 'FOB',
    deMinimisUSD: 400, // FOB, courier PSP
    ivaPct: 21,
    arancelGeneralPct: 50, // simplificado sobre el EXCEDENTE
    algoritmoEspecial: 'argentina-franquicia-courier',
    notas: [
      'Decreto 1065/2024 (vigente 03-dic-2024): franquicia US$400 FOB por envío en régimen courier (PSP — DHL, FedEx, MailAmericas, etc.)',
      'Hasta US$400 FOB: solo IVA 21%, sin arancel',
      'Sobre US$400 hasta US$3.000: arancel simplificado 50% sobre el EXCEDENTE + IVA 21% sobre el total FOB',
      'Máximo 5 envíos por año por persona, peso ≤ 50 kg, sin finalidad comercial',
      'Régimen postal (Correo Argentino): franquicia US$50, 12 envíos/año — usar courier privado para aprovechar US$400',
      'NO incluye Impuesto PAIS ni percepciones cambiarias del 30%/45% si pagas con tarjeta en pesos — esas se aplican aparte (varían según BCRA)',
      'La calculadora estima solo arancel + IVA del régimen courier; consulta tu banco para impuestos cambiarios',
    ],
    fuenteUrl: 'https://www.argentina.gob.ar/normativa/nacional/decreto-1065-2024-406688/texto',
    fuenteNombre: 'ARCA (Agencia de Recaudación y Control Aduanero, ex-AFIP)',
    fechaRevision: '2026-06-07',
    confianza: 'alta',
  },
  {
    pais: 'espana',
    moneda: 'EUR',
    baseCalculo: 'CIF',
    deMinimisUSD: 0, // sin minimis IVA desde jul-2021
    ivaPct: 21,
    arancelGeneralPct: 0, // 0 hasta 150€; sobre 150€ TARIC variable
    arancelFijoUE2026: {
      eurPorLinea: 3,
      vigenteDesde: '2026-07-01',
      aplicaHastaValorEUR: 150,
    },
    notas: [
      'Sin minimis IVA desde 1-jul-2021 (UE): TODO envío extracomunitario paga IVA 21%',
      'Hasta 30-jun-2026: envíos ≤150€ están exentos de arancel',
      'Desde 1-jul-2026 (Reglamento UE 2026/382): los envíos ≤150€ pagan 3€ fijos por cada línea TARIC además del IVA. Periodo transitorio hasta 1-jul-2028',
      'Régimen IOSS: si AliExpress/Shein/Temu cobran el IVA en checkout (lo hacen para ≤150€), no pagas nada al recibir el paquete',
      'Sin IOSS: pagas IVA + tasa de gestión al transportista (Correos: 1,24€; couriers: 10-30€)',
      'Sobre 150€: arancel TARIC específico por código de producto (0%-17%)',
    ],
    fuenteUrl: 'https://sede.agenciatributaria.gob.es/Sede/aduanas/novedades/2026/abril/30/novedades-comercio-electronico-1-julio.html',
    fuenteNombre: 'AEAT (Agencia Estatal de Administración Tributaria)',
    fechaRevision: '2026-06-07',
    confianza: 'alta',
  },
];

const bySlug = new Map(reglas.map((r) => [r.pais, r]));
export function reglaByPais(slug: string): ReglaAduana | undefined { return bySlug.get(slug); }
