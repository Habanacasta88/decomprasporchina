/** @jsxImportSource preact */
import { useId, useMemo, useState } from 'preact/hooks';
import type { JSX } from 'preact';
import { calcular, type Desglose } from '../../lib/calcular-aduana';
import type { ReglaAduana } from '../../data/aduana';
import { convertir, type Rates } from '../../lib/convertir-moneda';
import { formatCurrency } from '../../lib/i18n';

export interface Props {
  regla: ReglaAduana;
  locale: string;
  rates: Rates;
}

export default function AduanaWidget({ regla, locale, rates }: Props): JSX.Element {
  const valorId = useId();
  const envioId = useId();
  const headId = useId();

  const [valorRaw, setValorRaw] = useState<string>('100');
  const [envioRaw, setEnvioRaw] = useState<string>('0');

  const { desglose, error } = useMemo(() => {
    const v = Number.parseFloat(valorRaw.replace(',', '.'));
    const e = Number.parseFloat(envioRaw.replace(',', '.')) || 0;
    if (!Number.isFinite(v) || v < 0) return { desglose: null, error: 'Introduce un valor válido' };
    const d = calcular({ valor: v, envio: e, regla });
    return { desglose: d, error: '' };
  }, [valorRaw, envioRaw, regla]);

  const usd2local = (usd: number) =>
    formatCurrency(convertir(usd, 'USD', regla.moneda, rates), regla.moneda, locale);

  return (
    <section class="aduana-widget" aria-labelledby={headId}>
      <h2 id={headId} class="aduana-widget__title">Calcular impuestos al importar</h2>

      <div class="aduana-widget__row">
        <label htmlFor={valorId} class="aduana-widget__label">Valor del pedido (USD)</label>
        <input
          id={valorId}
          class="aduana-widget__input"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={valorRaw}
          onInput={(ev: JSX.TargetedEvent<HTMLInputElement>) => setValorRaw(ev.currentTarget.value)}
        />
      </div>

      <div class="aduana-widget__row">
        <label htmlFor={envioId} class="aduana-widget__label">
          Coste de envío (USD){' '}
          <span class="aduana-widget__opt">opcional</span>
        </label>
        <input
          id={envioId}
          class="aduana-widget__input"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={envioRaw}
          onInput={(ev: JSX.TargetedEvent<HTMLInputElement>) => setEnvioRaw(ev.currentTarget.value)}
        />
      </div>

      <output class={`aduana-widget__output ${error ? 'is-error' : ''}`} role="status" aria-live="polite" aria-atomic="true">
        {error && error}
        {desglose && !error && (
          <DesgloseView d={desglose} usd2local={usd2local} regla={regla} />
        )}
      </output>

      <p class="aduana-widget__disclaimer">
        ⚠ Estimación orientativa. No es asesoría fiscal ni aduanera. La normativa puede cambiar.
        Verifica con <a href={regla.fuenteUrl} target="_blank" rel="nofollow noopener">{regla.fuenteNombre}</a>.
      </p>
    </section>
  );
}

function DesgloseView({ d, usd2local, regla }: {
  d: Desglose;
  usd2local: (n: number) => string;
  regla: ReglaAduana;
}) {
  if (d.requiereDespachoFormal) {
    return (
      <div class="aduana-widget__formal">
        <strong>Requiere despacho formal con agente aduanal.</strong>
        <p>{d.notas.join(' ')}</p>
      </div>
    );
  }
  return (
    <div class="aduana-widget__desglose">
      {d.exentoPorMinimis ? (
        <p class="aduana-widget__exento">
          <strong>Exento de impuestos</strong> bajo el umbral de minimis (US${regla.deMinimisUSD}).
        </p>
      ) : (
        <dl class="aduana-widget__dl">
          {d.arancel > 0 && (
            <>
              <dt>{regla.algoritmoEspecial === 'mexico-tasa-global' ? 'Tasa global' : 'Arancel'}</dt>
              <dd>{usd2local(d.arancel)}</dd>
            </>
          )}
          {d.iva > 0 && (
            <>
              <dt>{regla.moneda === 'PEN' ? 'IGV' : 'IVA'} ({regla.ivaPct}%)</dt>
              <dd>{usd2local(d.iva)}</dd>
            </>
          )}
          {d.tasaAdicional > 0 && (
            <>
              <dt>Arancel fijo UE 2026/382</dt>
              <dd>{usd2local(d.tasaAdicional)}</dd>
            </>
          )}
          <dt class="aduana-widget__total">Total estimado</dt>
          <dd class="aduana-widget__total">{usd2local(d.totalImpuestosUSD)}</dd>
        </dl>
      )}
      {d.notaTasaGlobal && <p class="aduana-widget__nota">{d.notaTasaGlobal}</p>}
      {d.notas.length > 0 && <ul class="aduana-widget__notas">{d.notas.map((n) => <li>{n}</li>)}</ul>}
      {regla.pais === 'argentina' && (
        <p class="aduana-widget__pais-extra">
          ⚠ <strong>Argentina:</strong> esta estimación NO incluye Impuesto PAIS ni percepciones BCRA del 30%/45% si pagas con tarjeta en pesos. Calcula esas cargas por separado según tu medio de pago.
        </p>
      )}
    </div>
  );
}
