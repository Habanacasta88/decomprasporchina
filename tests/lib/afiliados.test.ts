import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('afiliados', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('aliexpress() devuelve la URL de tracking de env', async () => {
    vi.stubEnv('PUBLIC_ALIEXPRESS_TRACKING_URL', 'https://s.click.aliexpress.com/e/_test123');
    const { aliexpress } = await import('../../src/lib/afiliados.js');
    expect(aliexpress()).toBe('https://s.click.aliexpress.com/e/_test123');
  });

  it('aliexpress() avisa con warning si la env no existe', async () => {
    vi.stubEnv('PUBLIC_ALIEXPRESS_TRACKING_URL', '');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { aliexpress } = await import('../../src/lib/afiliados.js');
    aliexpress();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('PUBLIC_ALIEXPRESS_TRACKING_URL'));
    warn.mockRestore();
  });

  it('amazonEs() construye search URL con el tag', async () => {
    vi.stubEnv('PUBLIC_AMAZON_TAG_ES', 'mytag-21');
    const { amazonEs } = await import('../../src/lib/afiliados.js');
    expect(amazonEs({ q: 'zapatillas running' })).toBe(
      'https://www.amazon.es/s?k=zapatillas+running&tag=mytag-21',
    );
  });

  it('amazonEs() construye product URL con ASIN', async () => {
    vi.stubEnv('PUBLIC_AMAZON_TAG_ES', 'mytag-21');
    const { amazonEs } = await import('../../src/lib/afiliados.js');
    expect(amazonEs({ asin: 'B07GBLFPQN' })).toBe(
      'https://www.amazon.es/dp/B07GBLFPQN?tag=mytag-21',
    );
  });

  it('relAttrs() devuelve nofollow sponsored noopener', async () => {
    const { relAttrs } = await import('../../src/lib/afiliados.js');
    expect(relAttrs()).toBe('nofollow sponsored noopener');
  });
});
