import { describe, it, expect } from 'vitest';
import { reglas, reglaByPais } from '../../src/data/aduana';
import { paises } from '../../src/data/paises';

describe('aduana reglas', () => {
  it('hay una regla por cada país objetivo', () => {
    for (const p of paises) {
      const r = reglaByPais(p.slug);
      expect(r, `falta regla para ${p.slug}`).toBeDefined();
    }
  });

  it('toda regla tiene fuenteUrl oficial (.gob / .gov / .go.cr / europa.eu / aduana.cl / impo.com.uy)', () => {
    // aduana.cl es el dominio oficial del Servicio Nacional de Aduanas de Chile
    // (Chile no usa .gob.cl para esta autoridad — verificado en workflow wf_0fc45040)
    // .go.cr es el TLD oficial del gobierno de Costa Rica (Ministerio de Hacienda)
    // impo.com.uy es el sitio oficial del IMPO — Centro de Información Oficial uruguayo
    for (const r of reglas) {
      expect(r.fuenteUrl, `${r.pais} sin fuente oficial`).toMatch(/\.(gob|gov)\.|\.go\.cr|europa\.eu|aduana\.cl|impo\.com\.uy/);
    }
  });

  it('toda regla tiene fechaRevision en formato YYYY-MM-DD', () => {
    for (const r of reglas) {
      expect(r.fechaRevision).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('toda regla tiene confianza alta, media o baja', () => {
    for (const r of reglas) {
      expect(['alta', 'media', 'baja']).toContain(r.confianza);
    }
  });
});
