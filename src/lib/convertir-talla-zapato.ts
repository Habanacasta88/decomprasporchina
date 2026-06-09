import { TABLA_ZAPATOS, type Sistema } from '../data/tallas-zapatos';

export function convertirTallaZapato(valor: string, origen: Sistema, destino: Sistema): string {
  if (origen === destino) return valor;
  const fila = TABLA_ZAPATOS.find((f) => f[origen] === valor);
  if (!fila) throw new Error(`Talla ${valor} en sistema ${origen} no encontrada`);
  return fila[destino];
}
