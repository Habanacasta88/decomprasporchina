import type { ReglaAduana } from '../data/aduana';

export interface Desglose {
  base: number;
  arancel: number;
  iva: number;
  tasaAdicional: number;
  totalImpuestosUSD: number;
  exentoPorMinimis: boolean;
  notaTasaGlobal?: string;
  requiereDespachoFormal?: boolean;
  notas: string[];
}

export interface CalcularInput {
  valor: number;          // USD (valor del producto). Para España, valor en EUR.
  envio?: number;         // USD/EUR (flete y seguro)
  categoria?: string;     // opcional, futuro: aranceles por categoría
  regla: ReglaAduana;
  now?: Date;             // inyectable para tests + regímenes con vigencia futura (UE 2026/382)
}

const LIMITE_SIMPLIFICADO_MX = 2500;
const LIMITE_COURIER_AR = 3000;
const TOPE_4X4_USD = 400;
const ARANCEL_FIJO_4X4_USD = 20;
const FODINFA_PCT = 0.5;

export function calcular({ valor, envio = 0, regla, now = new Date() }: CalcularInput): Desglose {
  if (regla.algoritmoEspecial === 'mexico-tasa-global') return calcMexico(valor, envio, regla);
  if (regla.algoritmoEspecial === 'argentina-franquicia-courier') return calcArgentina(valor, envio, regla);
  if (regla.algoritmoEspecial === 'ecuador-courier-4x4') return calcEcuador(valor, envio, regla);
  return calcEstandar(valor, envio, regla, now);
}

function calcEcuador(valor: number, envio: number, regla: ReglaAduana): Desglose {
  if (valor <= TOPE_4X4_USD) {
    // Régimen Categoría B (Courier 4x4): USD 20 fijo + FODINFA 0.5% sobre FOB
    // NO se aplica IVA en este tramo
    const fodinfa = valor * (FODINFA_PCT / 100);
    return {
      base: valor,
      arancel: ARANCEL_FIJO_4X4_USD,
      iva: 0,
      tasaAdicional: fodinfa,
      totalImpuestosUSD: ARANCEL_FIJO_4X4_USD + fodinfa,
      exentoPorMinimis: false,
      notaTasaGlobal: `Régimen courier 4x4 (Resolución COMEX 006-2025): US$${ARANCEL_FIJO_4X4_USD} fijos + FODINFA ${FODINFA_PCT}% del FOB. Exento de IVA en este tramo.`,
      notas: [],
    };
  }
  // Sobre USD 400: Categoría C (estándar)
  // arancel ad valorem variable (usamos arancelGeneralPct como proxy) sobre CIF + IVA 15% + FODINFA 0.5%
  const cif = valor + envio;
  const arancel = cif * (regla.arancelGeneralPct / 100);
  const baseIva = cif + arancel;
  const iva = baseIva * (regla.ivaPct / 100);
  const fodinfa = cif * (FODINFA_PCT / 100);
  return {
    base: cif,
    arancel,
    iva,
    tasaAdicional: fodinfa,
    totalImpuestosUSD: arancel + iva + fodinfa,
    exentoPorMinimis: false,
    notas: [
      `Sobre US$${TOPE_4X4_USD}: Categoría C — arancel ad valorem variable según partida + IVA 15% + FODINFA 0,5%, todo sobre CIF.`,
      `Cifra orientativa: arancel real puede variar 5-30% según producto.`,
    ],
  };
}

function calcMexico(valor: number, envio: number, regla: ReglaAduana): Desglose {
  if (valor > LIMITE_SIMPLIFICADO_MX) {
    return {
      base: valor + envio,
      arancel: 0,
      iva: 0,
      tasaAdicional: 0,
      totalImpuestosUSD: 0,
      exentoPorMinimis: false,
      requiereDespachoFormal: true,
      notas: [`Sobre US$${LIMITE_SIMPLIFICADO_MX} requiere despacho formal con agente aduanal.`],
    };
  }
  const baseCIF = valor + envio;
  const tasaGlobal = baseCIF * (regla.arancelGeneralPct / 100);
  return {
    base: baseCIF,
    arancel: tasaGlobal,
    iva: 0,
    tasaAdicional: 0,
    totalImpuestosUSD: tasaGlobal,
    exentoPorMinimis: false,
    notaTasaGlobal: `Tasa global ${regla.arancelGeneralPct}% (Regla 3.7.35 RGCE) — incluye IGI + IVA + DTA.`,
    notas: [],
  };
}

function calcArgentina(valor: number, envio: number, regla: ReglaAduana): Desglose {
  if (valor > LIMITE_COURIER_AR) {
    return {
      base: valor + envio,
      arancel: 0,
      iva: 0,
      tasaAdicional: 0,
      totalImpuestosUSD: 0,
      exentoPorMinimis: false,
      requiereDespachoFormal: true,
      notas: [`Sobre US$${LIMITE_COURIER_AR} excede el régimen courier puerta a puerta.`],
    };
  }
  const baseFOB = valor;
  const minimis = regla.deMinimisUSD ?? 0;
  const excedente = Math.max(0, baseFOB - minimis);
  const arancel = excedente * (regla.arancelGeneralPct / 100); // 50% sobre excedente
  const iva = baseFOB * (regla.ivaPct / 100); // IVA sobre el FOB total
  return {
    base: baseFOB,
    arancel,
    iva,
    tasaAdicional: 0,
    totalImpuestosUSD: arancel + iva,
    exentoPorMinimis: excedente === 0,
    notas: excedente === 0
      ? [`Hasta US$${minimis} bajo franquicia courier — solo IVA ${regla.ivaPct}%.`]
      : [`Arancel ${regla.arancelGeneralPct}% sobre el excedente de US$${minimis} (US$${excedente.toFixed(2)}).`],
  };
}

function calcEstandar(valor: number, envio: number, regla: ReglaAduana, now: Date): Desglose {
  const baseTotal = regla.baseCalculo === 'CIF' ? valor + envio : valor;
  const minimis = regla.deMinimisUSD ?? 0;
  const bajoMinimis = minimis > 0 && valor <= minimis;

  // Chile especial: minimis = 0 pero arancel solo aplica sobre US$500 valor del bien.
  // Colombia: arancel solo si supera minimis, IVA siempre (China sin TLC).
  // Perú: ambos (arancel + IGV) exentos bajo US$200 FOB.
  // España: arancel 0 hasta 150€, IVA siempre; +3€ desde 1-jul-2026 si ≤150€.
  const aplicaArancel = regla.pais === 'chile'
    ? valor > 500
    : !bajoMinimis;

  const arancel = aplicaArancel ? baseTotal * (regla.arancelGeneralPct / 100) : 0;
  const baseIva = baseTotal + arancel;

  let aplicaIva = true;
  if (regla.pais === 'peru' && bajoMinimis) aplicaIva = false;

  const iva = aplicaIva ? baseIva * (regla.ivaPct / 100) : 0;

  // Tasa adicional fija UE 2026/382 (solo España):
  let tasaAdicional = 0;
  const tasaFija = regla.arancelFijoUE2026;
  if (tasaFija) {
    const vigente = now >= new Date(tasaFija.vigenteDesde + 'T00:00:00Z');
    if (vigente && valor <= tasaFija.aplicaHastaValorEUR) {
      tasaAdicional = tasaFija.eurPorLinea;
    }
  }

  const notas: string[] = [];
  if (tasaAdicional > 0) {
    notas.push(
      `Reglamento UE 2026/382: +${tasaAdicional}€ fijos por línea TARIC en envíos ≤${regla.arancelFijoUE2026!.aplicaHastaValorEUR}€ (vigente desde ${regla.arancelFijoUE2026!.vigenteDesde}).`,
    );
  }

  return {
    base: baseTotal,
    arancel,
    iva,
    tasaAdicional,
    totalImpuestosUSD: arancel + iva + tasaAdicional,
    exentoPorMinimis: bajoMinimis && arancel === 0 && iva === 0 && tasaAdicional === 0,
    notas,
  };
}
