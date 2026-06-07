export type Rates = Record<string, number>;

export function convertir(importe: number, origen: string, destino: string, rates: Rates): number {
  if (origen === destino) return importe;
  const rOrigen = rates[origen];
  const rDestino = rates[destino];
  if (rOrigen === undefined) throw new Error(`Moneda origen desconocida: ${origen}`);
  if (rDestino === undefined) throw new Error(`Moneda destino desconocida: ${destino}`);
  const enUSD = importe / rOrigen;
  return enUSD * rDestino;
}
