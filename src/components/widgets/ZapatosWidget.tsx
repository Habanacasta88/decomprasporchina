/** @jsxImportSource preact */
import { useId, useMemo, useState } from 'preact/hooks';
import type { JSX } from 'preact';
import { convertirTallaZapato } from '../../lib/convertir-talla-zapato';
import { TABLA_ZAPATOS, type Sistema } from '../../data/tallas-zapatos';

export interface Props {
  aliexpressUrl?: string;
}

const SISTEMAS: { value: Sistema; label: string }[] = [
  { value: 'CN', label: 'China (CN)' },
  { value: 'EU', label: 'Europa (EU)' },
  { value: 'US-mujer', label: 'US mujer' },
  { value: 'US-hombre', label: 'US hombre' },
  { value: 'UK', label: 'Reino Unido (UK)' },
  { value: 'JP', label: 'Japón (JP)' },
];

export default function ZapatosWidget({ aliexpressUrl }: Props): JSX.Element {
  const origenId = useId();
  const destinoId = useId();
  const tallaId = useId();
  const headingId = useId();

  const [origen, setOrigen] = useState<Sistema>('CN');
  const [destino, setDestino] = useState<Sistema>('EU');
  const [tallaRaw, setTallaRaw] = useState<string>('38');

  const tallasOrigen = useMemo(
    () => TABLA_ZAPATOS.map((f) => f[origen]).filter((v) => v !== '—'),
    [origen],
  );

  const { resultado, error, cm } = useMemo(() => {
    if (!tallaRaw) return { resultado: '', error: 'Selecciona una talla', cm: '' };
    try {
      const r = convertirTallaZapato(tallaRaw, origen, destino);
      const fila = TABLA_ZAPATOS.find((f) => f[origen] === tallaRaw);
      return { resultado: r, error: '', cm: fila ? `${fila.cm} cm` : '' };
    } catch (e) {
      return { resultado: '', error: (e as Error).message, cm: '' };
    }
  }, [origen, destino, tallaRaw]);

  return (
    <section class="zapatos-widget" aria-labelledby={headingId}>
      <h2 id={headingId} class="zapatos-widget__title">Conversor de tallas de zapatos</h2>

      <div class="zapatos-widget__row">
        <label htmlFor={origenId} class="zapatos-widget__label">Sistema de origen</label>
        <select id={origenId} class="zapatos-widget__select" value={origen}
          onChange={(e: JSX.TargetedEvent<HTMLSelectElement>) => setOrigen(e.currentTarget.value as Sistema)}>
          {SISTEMAS.map((s) => <option value={s.value}>{s.label}</option>)}
        </select>
      </div>

      <div class="zapatos-widget__row">
        <label htmlFor={tallaId} class="zapatos-widget__label">Tu talla en {origen}</label>
        <select id={tallaId} class="zapatos-widget__select" value={tallaRaw}
          onChange={(e: JSX.TargetedEvent<HTMLSelectElement>) => setTallaRaw(e.currentTarget.value)}>
          {tallasOrigen.map((t) => <option value={t}>{t}</option>)}
        </select>
      </div>

      <div class="zapatos-widget__row">
        <label htmlFor={destinoId} class="zapatos-widget__label">Convertir a</label>
        <select id={destinoId} class="zapatos-widget__select" value={destino}
          onChange={(e: JSX.TargetedEvent<HTMLSelectElement>) => setDestino(e.currentTarget.value as Sistema)}>
          {SISTEMAS.filter((s) => s.value !== origen).map((s) => <option value={s.value}>{s.label}</option>)}
        </select>
      </div>

      <output class={`zapatos-widget__output ${error ? 'is-error' : ''}`} role="status" aria-live="polite" aria-atomic="true">
        {error ? error : (
          <>
            <span class="zapatos-widget__resultado">Tu talla: <strong>{resultado}</strong></span>
            {cm && <span class="zapatos-widget__cm">Longitud pie: {cm}</span>}
          </>
        )}
      </output>

      {!error && resultado && aliexpressUrl && (
        <a href={aliexpressUrl} target="_blank" rel="nofollow sponsored noopener"
           class="zapatos-widget__inline-cta">
          Buscar zapatos talla {resultado} en AliExpress →
        </a>
      )}
    </section>
  );
}
