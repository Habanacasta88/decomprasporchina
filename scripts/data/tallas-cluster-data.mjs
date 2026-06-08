// scripts/data/tallas-cluster-data.mjs
// Datos de equivalencias talla-china ↔ talla-país para los 9 países secundarios.
// Sistemas usados:
// - Sistema europeo (EU 36/38/40...): Uruguay, Argentina-style — más común LATAM Cono Sur
// - Sistema letra (S/M/L/XL): Mayoría LATAM (Ecuador, Venezuela, Guatemala, Costa Rica, Bolivia, El Salvador)
// - Sistema US (number 28/30/32 hombre, 4/6/8 mujer): R. Dominicana (gran influencia US)
// - Panamá: mixto US + letras

export const TALLAS_POR_PAIS = [
  {
    slug: 'tallas-chinas-a-ecuatorianas',
    paisSlug: 'ecuador',
    paisNombre: 'Ecuador',
    gentilicio: 'ecuatorianas',
    monedaSlug: 'dolar',
    sistemaRopa: 'letra', // S/M/L
    sistemaCalzado: 'EU', // Ecuador usa EU
    notaCompra: 'Ecuador usa el sistema de letras (S/M/L) y dolares. Las tallas suelen ser similares al estandar US/EU.',
  },
  {
    slug: 'tallas-chinas-a-venezolanas',
    paisSlug: 'venezuela',
    paisNombre: 'Venezuela',
    gentilicio: 'venezolanas',
    monedaSlug: 'bolivar-venezolano',
    sistemaRopa: 'letra',
    sistemaCalzado: 'EU',
    notaCompra: 'Venezuela usa el sistema de letras (S/M/L) para ropa y EU para calzado. Verifica las medidas exactas porque las tallas chinas tienden a quedar mas pequenas.',
  },
  {
    slug: 'tallas-chinas-a-panamenas',
    paisSlug: 'panama',
    paisNombre: 'Panama',
    gentilicio: 'panamenas',
    monedaSlug: 'dolar',
    sistemaRopa: 'letra',
    sistemaCalzado: 'US',
    notaCompra: 'Panama usa influencia comercial US: ropa por letras (S/M/L) y calzado por talla US. Pide una talla por encima de la tuya US habitual.',
  },
  {
    slug: 'tallas-chinas-a-guatemaltecas',
    paisSlug: 'guatemala',
    paisNombre: 'Guatemala',
    gentilicio: 'guatemaltecas',
    monedaSlug: 'quetzal',
    sistemaRopa: 'letra',
    sistemaCalzado: 'EU',
    notaCompra: 'Guatemala usa sistema mixto: la mayoria de tiendas locales muestran tallas en letras (S/M/L) o numericas EU. Las tallas chinas son mas pequenas, pide una talla mas.',
  },
  {
    slug: 'tallas-chinas-a-costarricenses',
    paisSlug: 'costa-rica',
    paisNombre: 'Costa Rica',
    gentilicio: 'costarricenses',
    monedaSlug: 'colon-costarricense',
    sistemaRopa: 'letra',
    sistemaCalzado: 'EU',
    notaCompra: 'Costa Rica usa principalmente letras (S/M/L) para ropa y EU para calzado. Los productos chinos tienden a un patron mas pequeno.',
  },
  {
    slug: 'tallas-chinas-a-uruguayas',
    paisSlug: 'uruguay',
    paisNombre: 'Uruguay',
    gentilicio: 'uruguayas',
    monedaSlug: 'peso-uruguayo',
    sistemaRopa: 'EU', // Uruguay usa EU continental
    sistemaCalzado: 'EU',
    notaCompra: 'Uruguay usa sistema europeo continental (36/38/40...) tanto para ropa como calzado, igual que Argentina.',
  },
  {
    slug: 'tallas-chinas-a-bolivianas',
    paisSlug: 'bolivia',
    paisNombre: 'Bolivia',
    gentilicio: 'bolivianas',
    monedaSlug: 'boliviano',
    sistemaRopa: 'letra',
    sistemaCalzado: 'EU',
    notaCompra: 'Bolivia usa sistema de letras (S/M/L) y EU para calzado. Verifica medidas en cm si tienes dudas.',
  },
  {
    slug: 'tallas-chinas-a-dominicanas',
    paisSlug: 'republica-dominicana',
    paisNombre: 'Republica Dominicana',
    gentilicio: 'dominicanas',
    monedaSlug: 'peso-dominicano',
    sistemaRopa: 'letra-US',
    sistemaCalzado: 'US',
    notaCompra: 'Republica Dominicana usa fuerte influencia US: ropa por letras o US numerica (28/30/32 hombre, 4/6/8 mujer) y calzado US.',
  },
  {
    slug: 'tallas-chinas-a-salvadorenas',
    paisSlug: 'el-salvador',
    paisNombre: 'El Salvador',
    gentilicio: 'salvadorenas',
    monedaSlug: 'dolar',
    sistemaRopa: 'letra',
    sistemaCalzado: 'US',
    notaCompra: 'El Salvador usa sistema mixto: ropa por letras (S/M/L) y calzado US. Pide una talla mas que tu habitual local.',
  },
];

// Equivalencias estandar talla china ↔ letra (universal LATAM)
export const ROPA_MUJER_LETRA = [
  { china: 'S (155-160/80A)', local: 'XS / S', pecho: '80-84', cintura: '60-64' },
  { china: 'M (160-165/84A)', local: 'S / M',  pecho: '84-88', cintura: '64-68' },
  { china: 'L (165-170/88A)', local: 'M / L',  pecho: '88-92', cintura: '68-72' },
  { china: 'XL (170/92A)',    local: 'L / XL', pecho: '92-96', cintura: '72-76' },
  { china: '2XL (170-175/96A)', local: 'XL / 2XL', pecho: '96-100', cintura: '76-80' },
  { china: '3XL (175/100A)',  local: '2XL / 3XL', pecho: '100-104', cintura: '80-84' },
];

export const ROPA_MUJER_EU = [
  { china: 'S (155-160/80A)', local: '36', pecho: '80-84', cintura: '60-64' },
  { china: 'M (160-165/84A)', local: '38', pecho: '84-88', cintura: '64-68' },
  { china: 'L (165-170/88A)', local: '40', pecho: '88-92', cintura: '68-72' },
  { china: 'XL (170/92A)',    local: '42', pecho: '92-96', cintura: '72-76' },
  { china: '2XL (170-175/96A)', local: '44', pecho: '96-100', cintura: '76-80' },
  { china: '3XL (175/100A)',  local: '46', pecho: '100-104', cintura: '80-84' },
];

export const ROPA_HOMBRE_LETRA = [
  { china: 'S (165/88A)', local: 'S',    pecho: '88-92' },
  { china: 'M (170/92A)', local: 'M',    pecho: '92-96' },
  { china: 'L (175/96A)', local: 'L',    pecho: '96-100' },
  { china: 'XL (180/100A)', local: 'XL', pecho: '100-104' },
  { china: '2XL (185/104A)', local: '2XL', pecho: '104-108' },
  { china: '3XL (190/108A)', local: '3XL', pecho: '108-112' },
];

export const ROPA_HOMBRE_EU = [
  { china: 'S (165/88A)', local: '38', pecho: '88-92' },
  { china: 'M (170/92A)', local: '40', pecho: '92-96' },
  { china: 'L (175/96A)', local: '42', pecho: '96-100' },
  { china: 'XL (180/100A)', local: '44', pecho: '100-104' },
  { china: '2XL (185/104A)', local: '46', pecho: '104-108' },
  { china: '3XL (190/108A)', local: '48', pecho: '108-112' },
];

export const CALZADO_EU = [
  { china: '35', local: '35', cm: 22.5 },
  { china: '36', local: '36', cm: 23 },
  { china: '37', local: '37', cm: 23.5 },
  { china: '38', local: '38', cm: 24 },
  { china: '39', local: '39', cm: 24.5 },
  { china: '40', local: '40', cm: 25 },
  { china: '41', local: '41', cm: 25.5 },
  { china: '42', local: '42', cm: 26 },
  { china: '43', local: '43', cm: 26.5 },
  { china: '44', local: '44', cm: 27 },
];

export const CALZADO_US = [
  { china: '35', localMujer: '5',  localHombre: '4',  cm: 22.5 },
  { china: '36', localMujer: '6',  localHombre: '5',  cm: 23 },
  { china: '37', localMujer: '7',  localHombre: '6',  cm: 23.5 },
  { china: '38', localMujer: '8',  localHombre: '7',  cm: 24 },
  { china: '39', localMujer: '9',  localHombre: '8',  cm: 24.5 },
  { china: '40', localMujer: '10', localHombre: '9',  cm: 25 },
  { china: '41', localMujer: '11', localHombre: '10', cm: 25.5 },
  { china: '42', localMujer: '12', localHombre: '11', cm: 26 },
  { china: '43', localMujer: '—',  localHombre: '12', cm: 26.5 },
  { china: '44', localMujer: '—',  localHombre: '13', cm: 27 },
];
