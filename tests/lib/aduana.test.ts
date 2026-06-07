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

  it('toda regla tiene fuenteUrl oficial (.gob / .gov / europa.eu / aduana.cl)', () => {
    // aduana.cl es el dominio oficial del Servicio Nacional de Aduanas de Chile
    // (Chile no usa .gob.cl para esta autoridad — verificado en workflow wf_0fc45040)
    for (const r of reglas) {
      expect(r.fuenteUrl, `${r.pais} sin fuente oficial`).toMatch(/\.(gob|gov)\.|europa\.eu|aduana\.cl/);
    }
  });

  it('toda regla tiene fechaRevision en formato YYYY-MM-DD', () => {
    for (const r of reglas) {
      expect(r.fechaRevision).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('toda regla tiene confianza alta o media (nada baja en v1)', () => {
    for (const r of reglas) {
      expect(['alta', 'media']).toContain(r.confianza);
    }
  });
});
