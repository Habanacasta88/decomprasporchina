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
  confianza: 'alta' | 'media' | 'baja';
  algoritmoEspecial?: 'mexico-tasa-global' | 'argentina-franquicia-courier' | 'ecuador-courier-4x4';
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
  {
    pais: 'ecuador',
    moneda: 'USD',
    baseCalculo: 'FOB',
    deMinimisUSD: 0, // El régimen 4x4 NO exime, cobra USD 20 fijo + FODINFA 0.5%
    ivaPct: 15,
    arancelGeneralPct: 20, // USD 20 fijos por envío (no porcentaje — el algoritmo lo aplica como cantidad)
    algoritmoEspecial: 'ecuador-courier-4x4',
    notas: [
      'Régimen courier 4x4 (Categoría B, Resolución COMEX 006-2025 vigente 16-jun-2025): hasta US$400 FOB y 4 kg paga US$20 fijos + FODINFA 0,5% sobre el FOB. NO se aplica IVA 15% ni ICE en este tramo.',
      'Ejemplo: pedido de US$50 paga US$20,25 total; pedido de US$200 paga US$21,00; pedido de US$400 paga US$22,00.',
      'Sobre US$400 FOB o 4 kg: pasa a Categoría C con tributación regular: ad valorem variable (5-30% típico) + IVA 15% + FODINFA 0,5%, todo sobre base CIF.',
      'Régimen postal 2x2 (Decreto Ejecutivo 82, vigente 20-ago-2025): hasta 2 kg y US$2 totalmente exonerado vía Correos del Ecuador.',
      'Límite anual Categoría B: US$1.600 FOB acumulados por persona/año. Pasado el tope, las siguientes compras tributan como Categoría C.',
      'Ecuador usa USD como moneda oficial — sin riesgo cambiario al recibir.',
      'ISD (Impuesto Salida de Divisas) 5% lo paga quien envía dinero al exterior (banco/tarjeta), no el receptor del paquete.',
      'Productos prohibidos en 4x4: ropa usada, alcohol, dinero efectivo, material publicitario.',
    ],
    fuenteUrl: 'https://www.aduana.gob.ec/servicio-al-ciudadano/envios-courier-postal/',
    fuenteNombre: 'SENAE (Servicio Nacional de Aduana del Ecuador)',
    fechaRevision: '2026-06-07',
    confianza: 'media',
  },
  {
    pais: 'venezuela',
    moneda: 'VES',
    baseCalculo: 'FOB',
    deMinimisUSD: 100,
    ivaPct: 16,
    arancelGeneralPct: 15, // promedio orientativo; varía 0-20% según partida
    notas: [
      'Resolución SENIAT 3.283 (Gaceta Oficial 36.127, 16-ene-1997, sigue vigente): envíos courier puerta a puerta sin fines comerciales hasta US$100 FOB están exentos de arancel e IVA.',
      'De US$101 a US$2.000 FOB: régimen de Alto Valor (recargo aproximado 35%, suele cobrarse en origen).',
      'Sobre US$2.000 FOB: importación formal con agente aduanal (DUA), arancel ad valorem variable 0-20% + IVA 16% + tasa servicio aduanero 1% sobre CIF.',
      'NOTA SITUACIÓN PAÍS: la cobertura informativa pública de SENIAT es limitada por la situación económica/política. Las cifras pueden estar desactualizadas. Confirma con tu courier o con SENIAT antes de hacer el pedido.',
      'Decreto 5.198 (Gaceta Oficial Extraordinaria 6.952, 31-dic-2025, vigente 5-ene-2026): 9ª Reforma del Arancel — modifica 753 subpartidas, introduce "Permiso COMEX" en sustitución de Licencia de Importación.',
      'Controles cambiarios complican el pago: muchas plataformas no operan directamente con tarjetas venezolanas. AliExpress/Temu/Shein suelen llegar vía servicios de casillero/courier de terceros (Tealca, Tu Paquetico, Liberty Express).',
    ],
    fuenteUrl: 'https://declaraciones.seniat.gob.ve/portal/page/portal/MANEJADOR_CONTENIDO_SENIAT/04ADUANAS/4.1OBLIGACIONES_ADUAN/4.1.1-3.html',
    fuenteNombre: 'SENIAT (Servicio Nacional Integrado de Administración Aduanera y Tributaria)',
    fechaRevision: '2026-06-07',
    confianza: 'baja',
  },
  {
    pais: 'panama',
    moneda: 'USD',
    baseCalculo: 'CIF',
    deMinimisUSD: 100,
    ivaPct: 7, // ITBMS
    arancelGeneralPct: 10, // promedio orientativo NMF (rango real 0-15%)
    notas: [
      'Envíos courier hasta US$100 CIF están exentos de arancel e ITBMS (Decreto de Gabinete 41/2002, actualizado por Resolución 049/2025 ANA, vigente 12-mar-2025).',
      'Sobre US$100 CIF: arancel ad valorem según partida (rango 0-15%, promedio ~10%) + ITBMS 7% sobre (CIF + arancel).',
      'Panamá NO tiene TLC con China: aplica arancel NMF (Nación Más Favorecida) completo.',
      'Sobre US$500 CIF: requiere corredor de aduanas (honorarios privados ~US$50-150 adicionales).',
      'Para AliExpress/Shein/Temu llegando vía casillero (Miami): paga ITBMS + arancel al ingresar a Panamá si supera US$100 CIF.',
      'Panamá usa USD y Balboa (B/.) en paridad 1:1 — sin riesgo cambiario.',
      'Zona Libre de Colón opera bajo régimen aparte (no aplica a compras personales online típicas).',
    ],
    fuenteUrl: 'https://ana.gob.pa/w_ana/index.php/servicios-y-plataformas/regimenes-aduaneros-2/despacho-aduanero',
    fuenteNombre: 'ANA (Autoridad Nacional de Aduanas de Panamá)',
    fechaRevision: '2026-06-07',
    confianza: 'alta',
  },
  {
    pais: 'guatemala',
    moneda: 'GTQ',
    baseCalculo: 'CIF',
    deMinimisUSD: 0, // no hay exención courier comercial
    ivaPct: 12,
    arancelGeneralPct: 10, // promedio orientativo (rango real 0-20%)
    notas: [
      'Guatemala NO tiene de minimis para courier comercial — toda mercancía importada vía courier paga IVA 12% + DAI desde el primer quetzal de valor CIF.',
      'Hasta US$1.000 CIF: "Despacho Simplificado" (procedimiento SAT PR-IAD-DNO-DE-12) — sin agente aduanal pero pagando IVA + DAI.',
      'DAI varía 0-20% según partida (más común: 0%, 5%, 10%, 15%). Promedio efectivo reportado por SAT para courier: ~27% (IVA + DAI combinados).',
      'Fórmula: DAI = CIF × %arancel; IVA = (CIF + DAI) × 12%; Total = DAI + IVA.',
      'Base CIF: factura + flete internacional + seguro (2,2% aéreo / 1,65% marítimo si no se declara).',
      'China NO tiene TLC con Guatemala — aplica arancel NMF completo. La exención USD 500 RECAUCA es solo para equipaje de viajero presencial, NO courier.',
      'Sobre US$1.000 CIF: obligatorio DUCA + agente aduanal autorizado.',
      'Productos exentos de IVA: libros impresos, medicamentos con receta, fórmula infantil.',
    ],
    fuenteUrl: 'https://portal.sat.gob.gt/portal/preguntas-frecuentes/temas-aduaneros/',
    fuenteNombre: 'SAT Guatemala (Superintendencia de Administración Tributaria)',
    fechaRevision: '2026-06-07',
    confianza: 'media',
  },
  {
    pais: 'costa-rica',
    moneda: 'CRC',
    baseCalculo: 'CIF',
    deMinimisUSD: 0, // NO hay exención para compras comerciales (el US$500 solo aplica a envíos familiares no comerciales una vez cada 6 meses)
    ivaPct: 13,
    arancelGeneralPct: 14, // orientativo histórico; varía 0-15% según partida tras TLC China-Costa Rica
    notas: [
      'Costa Rica NO tiene de minimis para compras propias online — la exención USD 500 (cada 6 meses) aplica EXCLUSIVAMENTE a envíos familiares no comerciales (RECAUCA IV desde mayo 2021).',
      'TLC Costa Rica-China vigente desde 1-ago-2011: muchos productos ya desgravados a 0%. Resolución MH-DGA-RES-0209-2025 (20-feb-2025) eliminó aranceles a camisas, T-shirts, sostenes y cocinas de gas chinas.',
      'DAI varía 0-15% según partida arancelaria (rango histórico 1-15%). Promedio efectivo reportado por La Nación: 13-55% carga total según categoría.',
      'Fórmula en cascada: DAI = CIF × %arancel; +Ley 6946 = CIF × 1% (fondo emergencias); Base IVA = CIF + DAI + Ley 6946; IVA = Base × 13%.',
      'ISC (Impuesto Selectivo al Consumo) variable solo para suntuarios: alcohol, tabaco, electrónica de gama alta, joyería.',
      'Régimen courier (DHL, FedEx, UPS, Aerocasillas, JetBox) gestiona el manifiesto. Couriers registrados NO pueden gestionar el famoso US$500 desde mayo 2021.',
      'Para AliExpress/Temu/Shein: paga IVA 13% + DAI + Ley 6946 desde el primer dólar sobre CIF.',
    ],
    fuenteUrl: 'https://www.hacienda.go.cr/docs/INSTRUCTIVO_CALCULO_OBLIGACION_TRIBUTARIA.pdf',
    fuenteNombre: 'Ministerio de Hacienda — Dirección General de Aduanas Costa Rica',
    fechaRevision: '2026-06-07',
    confianza: 'media',
  },
  {
    pais: 'uruguay',
    moneda: 'UYU',
    baseCalculo: 'FOB',
    deMinimisUSD: 800, // franquicia anual, NO por envío
    ivaPct: 22,
    arancelGeneralPct: 60, // tasa única simplificada del 60% sobre factura
    notas: [
      'Decreto 50/026 (vigente 1-may-2026): franquicia anual US$800 por persona física, máximo 3 envíos/año, peso máx 20 kg por envío.',
      'IMPORTANTE: la franquicia NO exonera IVA — China no tiene acuerdo comercial con Uruguay, así que bajo franquicia SIEMPRE paga IVA 22% sobre el valor de factura.',
      'Si se consumen los 3 envíos / US$800 anuales o si el envío supera US$800: régimen simplificado del 60% sobre factura (sustituye TODA la tributación: arancel + IVA + tasas), mínimo US$20 por envío.',
      'Sobre US$800 o 20 kg: régimen general con despachante de aduana (DUA), arancel NMF Mercosur según NCM + IVA 22% + tasas + IMESI si aplica.',
      'Antes del 1-may-2026 regía el Decreto 356/014 con franquicia US$200 por envío (3 envíos/año) y sin IVA. El cambio cuadruplica la franquicia y elimina la exención IVA — la prensa lo llama "impuesto Temu".',
      'El régimen se aplica igual a courier privado (DHL, Tiendamia, Aerobox) y Correo Uruguayo.',
    ],
    fuenteUrl: 'https://www.impo.com.uy/bases/decretos-originales/50-2026',
    fuenteNombre: 'IMPO Uruguay — Decreto N° 50/026 + DNA (Dirección Nacional de Aduanas)',
    fechaRevision: '2026-06-07',
    confianza: 'alta',
  },
  {
    pais: 'bolivia',
    moneda: 'BOB',
    baseCalculo: 'CIF',
    deMinimisUSD: 0,
    ivaPct: 14.94, // tasa efectiva (13% nominal calculado "por dentro")
    arancelGeneralPct: 10, // promedio orientativo (rango real 0-20% según NANDINA)
    notas: [
      'Bolivia NO tiene de minimis tipo "exento" para courier — toda mercancía importada vía courier paga IVA + GA desde el primer dólar.',
      'IVA nominal 13% (Ley 843) pero se calcula "por dentro" — tasa efectiva sobre base imponible importación = 13/(100-13) = 14,94%.',
      'GA (Gravamen Arancelario) varía 0-20% según partida NANDINA. Arancel Aduanero 2026 (AAI-2026, RM 557/2025 vigente 1-ene-2026) mantiene tasas escalonadas: 0%, 5%, 10%, 15%, 20%.',
      'Fórmula: CIF = FOB + flete + seguro; GA = CIF × %arancel; Base IVA = CIF + GA + otros gastos aduaneros; IVA = Base IVA × 14,94%. Carga típica total: 16-37% del CIF.',
      'Régimen courier (RD 01-064-25 vigente 10-sep-2025): hasta US$1.000 FOB / 40 kg = despacho simplificado.',
      'Decreto Supremo 5518 (vigente 17-ene-2026): GA = 0% para electrónica línea blanca (laptops, tablets con IMEI, smartphones, cámaras, consolas, monitores). Solo queda IVA 14,94%.',
      'Bolivia NO tiene TLC con China (no aplican preferencias CAN ni MERCOSUR para origen China).',
      'El IT (Impuesto Transacciones 3%) NO se paga en aduana — solo en ventas internas.',
    ],
    fuenteUrl: 'https://www.aduana.gob.bo/sites/default/files/ReglamentoVigente/RD%2001-064-25%20%20=%20%2029_08_2025%20REGLAMENTO%20PARA%20EL%20SERVICIO%20EXPRESO%20-%20COURIERV2.pdf',
    fuenteNombre: 'Aduana Nacional de Bolivia — RD 01-064-25 Reglamento Servicio Courier',
    fechaRevision: '2026-06-07',
    confianza: 'media',
  },
  {
    pais: 'republica-dominicana',
    moneda: 'DOP',
    baseCalculo: 'CIF',
    deMinimisUSD: 200, // FOB para el umbral, CIF para el cálculo
    ivaPct: 18, // ITBIS
    arancelGeneralPct: 10, // promedio orientativo (rango real 0-40%, típico bienes consumo 0-20%)
    notas: [
      'Envíos courier para fines personales con valor FOB ≤ US$200 están exentos de arancel e ITBIS (Decreto 402-05 categoría B + Ley 168-21).',
      'TODOS los envíos courier pagan tasa fija de US$0,25/kg (Decreto 627-06), exentos o no de tributos.',
      'De US$200.01 a US$2.000 FOB: arancel ad valorem según partida (rango 0-40%, típico bienes consumo 0-20%) + ITBIS 18% sobre base ampliada (CIF + arancel + otros).',
      'Aranceles típicos productos China sin TLC: electrónica (móviles, laptops) suele 0%, textiles/calzado 20%, juguetes 10%.',
      'China NO tiene TLC con República Dominicana: aplica arancel NMF completo.',
      'Se requiere RUA (Registro Único de Aduanas) para compradores por internet (Norma 01-2018).',
      'Para AliExpress/Temu/Shein: mantén facturas para acreditar FOB ≤ US$200.',
      'ISC variable solo para suntuarios: alcohol, tabaco, cosméticos de lujo, joyería, vehículos.',
    ],
    fuenteUrl: 'https://www.aduanas.gob.do/preguntas-frecuentes/',
    fuenteNombre: 'DGA (Dirección General de Aduanas de República Dominicana)',
    fechaRevision: '2026-06-07',
    confianza: 'alta',
  },
  {
    pais: 'el-salvador',
    moneda: 'USD',
    baseCalculo: 'CIF',
    deMinimisUSD: 300, // exoneración de DAI hasta US$300 (NO exonera IVA)
    ivaPct: 13,
    arancelGeneralPct: 10, // orientativo (rango real 0-40%, típico 5-15%)
    notas: [
      'Ley de Facilitación de Compras en Línea sin Fines Comerciales (Decreto 208, vigente 25-nov-2021 sin fecha de expiración).',
      'Hasta US$300: solo paga IVA 13% sobre Valor en Aduana. DAI exonerado.',
      'Valor en Aduana (Art. 5 Decreto 208) = Precio factura + 10% flete presunto + 1,5% seguro presunto (si no se documentan reales).',
      'Sobre US$300: pierde el beneficio completo. Paga DAI según partida (rango 0-40%, típico 5-15%) + IVA 13% sobre (CIF + DAI).',
      'El IVA 13% se calcula SIEMPRE sobre (Valor Aduana + DAI), incluso bajo la ley de facilitación.',
      'China NO tiene TLC con El Salvador: aranceles MFN del Sistema Arancelario Centroamericano (SAC 2026) entre 0-40%.',
      'Aranceles típicos: ropa/calzado 15%, electrónica consumo 5-10%, electrodomésticos 10%, smartphones/laptops 0%, juguetes 10%.',
      'El Salvador usa USD desde 2001 — sin riesgo cambiario.',
      'Exclusiones de la Ley 208: medicamentos con prescripción, precursores químicos, armas, pirotécnicos, equipos emisores radiaciones.',
    ],
    fuenteUrl: 'https://sitio.aduana.gob.sv/servicios/despacho-de-mercancias-ingresadas-por-personas-calificadas-por-la-dga-como-gestores-de-encomiendas/',
    fuenteNombre: 'DGA El Salvador (Dirección General de Aduanas — Ministerio de Hacienda)',
    fechaRevision: '2026-06-07',
    confianza: 'alta',
  },
];

const bySlug = new Map(reglas.map((r) => [r.pais, r]));
export function reglaByPais(slug: string): ReglaAduana | undefined { return bySlug.get(slug); }
