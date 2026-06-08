export type Sistema = 'CN' | 'EU' | 'US-mujer' | 'US-hombre' | 'UK' | 'JP';

export interface EquivalenciaZapato {
  CN: string;
  EU: string;
  'US-mujer': string;
  'US-hombre': string;
  UK: string;
  JP: string;
  cm: number;
}

// Tabla maestra construida desde múltiples fuentes (Nike, Adidas, Shein):
export const TABLA_ZAPATOS: EquivalenciaZapato[] = [
  { CN: '34', EU: '34', 'US-mujer': '3.5', 'US-hombre': '2.5', UK: '2', JP: '22', cm: 21.5 },
  { CN: '35', EU: '35', 'US-mujer': '5',   'US-hombre': '3.5', UK: '3', JP: '22.5', cm: 22 },
  { CN: '36', EU: '36', 'US-mujer': '6',   'US-hombre': '4.5', UK: '3.5', JP: '23', cm: 22.5 },
  { CN: '37', EU: '37', 'US-mujer': '7',   'US-hombre': '5.5', UK: '4.5', JP: '23.5', cm: 23 },
  { CN: '38', EU: '38', 'US-mujer': '8',   'US-hombre': '7',   UK: '5.5', JP: '24', cm: 23.5 },
  { CN: '39', EU: '39', 'US-mujer': '9',   'US-hombre': '8',   UK: '6',   JP: '24.5', cm: 24 },
  { CN: '40', EU: '40', 'US-mujer': '10',  'US-hombre': '9',   UK: '6.5', JP: '25', cm: 24.5 },
  { CN: '41', EU: '41', 'US-mujer': '11',  'US-hombre': '10',  UK: '7.5', JP: '26', cm: 25 },
  { CN: '42', EU: '42', 'US-mujer': '12',  'US-hombre': '11',  UK: '8',   JP: '26.5', cm: 25.5 },
  { CN: '43', EU: '43', 'US-mujer': '—',   'US-hombre': '12',  UK: '9',   JP: '27', cm: 26 },
  { CN: '44', EU: '44', 'US-mujer': '—',   'US-hombre': '13',  UK: '10',  JP: '27.5', cm: 26.5 },
  { CN: '45', EU: '45', 'US-mujer': '—',   'US-hombre': '14',  UK: '10.5', JP: '28', cm: 27 },
];
