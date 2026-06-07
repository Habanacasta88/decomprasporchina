/** @jsxImportSource preact */
import { useId, useMemo, useState } from 'preact/hooks';
import type { JSX } from 'preact';
import { convertir, type Rates } from '../../lib/convertir-moneda';
import { formatCurrency } from '../../lib/i18n';

export type Origen = 'CNY' | 'USD';

export interface Props {
  monedaDestino: string;
  locale: string;
  rates: Rates;
  fechaTipoCambio: string;
}

export default function MonedaWidget({
  monedaDestino, locale, rates, fechaTipoCambio,
}: Props): JSX.Element {
  const importeId = useId();
  const monedaId = useId();
  const headingId = useId();
  const helpId = useId();

  const [importeRaw, setImporteRaw] = useState<string>('100');
  const [moneda, setMoneda] = useState<Origen>('CNY');

  const { resultado, error } = useMemo(() => {
    const normalizado = importeRaw.replace(',', '.').trim();
    const num = Number.parseFloat(normalizado);
    if (!Number.isFinite(num) || num < 0) {
      return { resultado: '', error: 'Introduce un importe válido' };
    }
    try {
      const out = convertir(num, moneda, monedaDestino, rates);
      return { resultado: formatCurrency(out, monedaDestino, locale), error: '' };
    } catch (e) {
      return { resultado: '', error: (e as Error).message };
    }
  }, [importeRaw, moneda, monedaDestino, rates, locale]);

  return (
    <section class="moneda-widget" aria-labelledby={headingId}>
      <h3 id={headingId} class="moneda-widget__title">Convertir a {monedaDestino}</h3>
      <p id={helpId} class="moneda-widget__help">
        Tipo de cambio actualizado el {fechaTipoCambio}. Valor orientativo.
      </p>

      <div class="moneda-widget__row">
        <label htmlFor={importeId} class="moneda-widget__label">Importe</label>
        <input
          id={importeId}
          class="moneda-widget__input"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          aria-describedby={helpId}
          aria-invalid={error ? 'true' : 'false'}
          value={importeRaw}
          onInput={(e: JSX.TargetedEvent<HTMLInputElement>) => setImporteRaw(e.currentTarget.value)}
        />
      </div>

      <div class="moneda-widget__row">
        <label htmlFor={monedaId} class="moneda-widget__label">Moneda origen</label>
        <select
          id={monedaId}
          class="moneda-widget__select"
          value={moneda}
          onChange={(e: JSX.TargetedEvent<HTMLSelectElement>) => setMoneda(e.currentTarget.value as Origen)}
        >
          <option value="CNY">Yuan chino (CNY)</option>
          <option value="USD">Dólar estadounidense (USD)</option>
        </select>
      </div>

      <output
        class={`moneda-widget__output ${error ? 'is-error' : ''}`}
        htmlFor={`${importeId} ${monedaId}`}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {error ? error : <><span class="sr-only">Resultado: </span>{resultado}</>}
      </output>
    </section>
  );
}
