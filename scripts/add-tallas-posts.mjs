#!/usr/bin/env node
// Inserta 2 posts nuevos en src/data/posts.json: tallas-chinas-a-argentinas y tallas-chinas-a-espanolas
// Sigue exactamente el patron de las 4 paginas hermanas existentes (Chile, Mexico, Peru, Colombia).

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const POSTS_PATH = path.join(__dirname, '..', 'src', 'data', 'posts.json');

// Helper: genera body HTML con misma estructura que Chile/Mexico/Peru/Colombia.
// Argumentos:
//   pais        — "Argentina" | "Espana"
//   gentilicio  — "argentina"  | "espanola"   (en minuscula, para "talla X")
//   gentilicioP — "argentinas" | "espanolas"  (plural)
//   id          — sufijo unico para IDs JS (ar | es)
//   tiendasLocales — texto "Falabella, Garbarino, Cencosud" etc.
//   tablaMujer  — array {chile, china}  (etiquetamos generico, lo reusamos)
//   tablaHombre — idem
//   datMujer    — objeto JS {"36":"S",...}  para el script de la calculadora
//   datHombre   — idem
function buildBody(opts) {
  const {
    pais, gentilicio, gentilicioP, id, tiendasLocales,
    tablaMujer, tablaHombre, datMujer, datHombre,
    introExtra, consejoConvert,
    crossLinkPrecio, crossLinkAduana,
    crossLinkPrecioLabel, crossLinkAduanaLabel,
  } = opts;

  // tabla ninos (compartida)
  const tablaNinos = [
    { local: '4', china: '100' },
    { local: '6', china: '110' },
    { local: '8', china: '120' },
    { local: '10', china: '130' },
    { local: '12', china: '140' },
  ];
  const datNinos = { '4': '100', '6': '110', '8': '120', '10': '130', '12': '140' };

  const rowsMujer = tablaMujer.map(r => `<tr><td>${r.local}</td><td>${r.china}</td></tr>`).join('');
  const rowsHombre = tablaHombre.map(r => `<tr><td>${r.local}</td><td>${r.china}</td></tr>`).join('');
  const rowsNinos = tablaNinos.map(r => `<tr><td>${r.local}</td><td>${r.china}</td></tr>`).join('');

  // Serializa los datos JS de forma compacta (idéntico al estilo de Chile).
  const jsData = JSON.stringify({ m: datMujer, h: datHombre, nino: datNinos }).replace(/"([0-9]+)":/g, '"$1":');

  // CSS y JS replican el de Chile, sustituyendo solo el sufijo de IDs.
  const css = `<style>.tc-box{background:linear-gradient(135deg,#fff9f0 0%,#fff 60%);border:2px solid #e8890a;border-radius:16px;padding:1.5rem;margin:2rem 0;max-width:640px}.tc-header h3{margin:0 0 .2rem;font-size:1.25rem;color:#1a1a1a}.tc-sub{color:#7a746c;font-size:.85rem;margin:0 0 1.2rem}.tc-grid{display:grid;grid-template-columns:1fr 1fr;gap:.75rem}@media(max-width:480px){.tc-grid{grid-template-columns:1fr}}.tc-field{margin-bottom:.5rem}.tc-field label{display:block;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#8a8480;margin-bottom:.25rem}.tc-field select{width:100%;padding:.6rem .75rem;border:1px solid #e2ddd5;border-radius:8px;font-size:.9rem;background:#fff;box-sizing:border-box}.tc-field select:focus{outline:none;border-color:#e8890a;box-shadow:0 0 0 3px rgba(232,137,10,.12)}#tc-b-${id}{display:block;width:100%;margin:1rem 0 0;padding:.75rem;background:#c8200f;color:#fff;border:none;border-radius:10px;font-size:1rem;font-weight:700;cursor:pointer}#tc-b-${id}:hover{background:#a81a0c}.tc-result{margin-top:1.25rem;animation:tc-fade .4s ease-out}@keyframes tc-fade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}.tc-result-main{background:#c8200f;color:#fff;text-align:center;padding:1rem 1.5rem;border-radius:12px}.tc-result-label{display:block;font-size:.7rem;text-transform:uppercase;letter-spacing:.1em;opacity:.85}.tc-result-value{display:block;font-size:2.2rem;font-weight:800;margin-top:.15rem}.tc-detail{text-align:center;font-size:.9rem;color:#3d3832;margin-top:.75rem;line-height:1.5}</style>`;

  const js = `<script>(function(){var d=${jsData};var g=document.getElementById("tc-g-${id}"),s=document.getElementById("tc-s-${id}"),b=document.getElementById("tc-b-${id}"),r=document.getElementById("tc-r-${id}"),v=document.getElementById("tc-v-${id}"),dd=document.getElementById("tc-d-${id}");function u(){var x=g.value,sz=d[x];s.innerHTML='<option value="">Selecciona</option>';if(sz)Object.keys(sz).forEach(function(k){var o=document.createElement("option");o.value=k;o.textContent=k;s.appendChild(o)})}function c(){var x=g.value,k=s.value;if(!k)return;var cn=d[x]&&d[x][k];v.textContent=cn?(cn+" (China)"):"?";dd.innerHTML="Tu <strong>"+k+"</strong> en ${pais} = <strong>"+(cn||"?")+" en China</strong>";r.style.display="block";r.style.animation="none";r.offsetHeight;r.style.animation="tc-fade .4s ease-out"}g.addEventListener("change",u);b.addEventListener("click",c);s.addEventListener("change",function(){if(s.value)c()});u()})();</script>`;

  return `<p>${introExtra}</p>

<h2>Tabla de tallas de mujer: ${pais} a China</h2>
<p>Si compras en ${tiendasLocales}, esta tabla te dice que talla pedir en tiendas chinas:</p>
<table><thead><tr><th>Talla ${pais}</th><th>Talla China</th></tr></thead><tbody>${rowsMujer}</tbody></table>
<p><strong>Consejo:</strong> ${consejoConvert}</p>

<h2>Tabla de tallas de hombre: ${pais} a China</h2>
<p>Para hombres, la diferencia suele ser de 1-2 tallas:</p>
<table><thead><tr><th>Talla ${pais}</th><th>Talla China</th></tr></thead><tbody>${rowsHombre}</tbody></table>

<h2>Tallas de ninos: ${pais} a China</h2>
<p>Las tallas infantiles chinas van por cm de altura:</p>
<table><thead><tr><th>Talla ${pais}</th><th>Talla China (cm)</th></tr></thead><tbody>${rowsNinos}</tbody></table>

<h2>Calculadora de tallas ${pais}-China</h2>
<p>Convierte tu talla al instante:</p>
<div id="talla-calc-${id}" class="tc-box"><div class="tc-header"><h3>Calculadora ${pais}-China</h3><p class="tc-sub">Resultado instantaneo</p></div><div class="tc-grid"><div class="tc-field"><label for="tc-g-${id}">Genero</label><select id="tc-g-${id}"><option value="m">Mujer</option><option value="h">Hombre</option><option value="nino">Ninos</option></select></div><div class="tc-field"><label for="tc-s-${id}">Tu talla</label><select id="tc-s-${id}"><option value="">Elige genero</option></select></div></div><button id="tc-b-${id}" type="button">Ver mi talla china</button><div id="tc-r-${id}" class="tc-result" style="display:none"><div class="tc-result-main"><span class="tc-result-label">Tu talla en China</span><span class="tc-result-value" id="tc-v-${id}">-</span></div><div id="tc-d-${id}" class="tc-detail"></div></div></div>
${css}
${js}

<h2>Consejos para acertar con tu talla china desde ${pais}</h2>
<ul>
<li><strong>Mide tu cuerpo:</strong> Usa cinta metrica para medir contorno de pecho, cintura y cadera. Compara con la tabla del vendedor.</li>
<li><strong>Sube 1-2 tallas:</strong> Pide 1 o 2 tallas mas de lo que usas en ${tiendasLocales}.</li>
<li><strong>Lee los comentarios:</strong> Busca comentarios de compradores de ${pais} sobre el tallaje real.</li>
<li><strong>Compra con devolucion:</strong> AliExpress y Shein ofrecen devolucion gratis en muchos productos.</li>
</ul>

<h2>Preguntas frecuentes</h2>
<details><summary>La talla M de ${pais} es igual que la M china?</summary><p>No. La M china es mas pequena. Si usas M en ${tiendasLocales}, necesitaras L o XL en tiendas chinas.</p></details>
<details><summary>Como se si una tienda china talla grande o pequeno?</summary><p>Revisa los comentarios de compradores y busca fotos reales. Puedes preguntar al vendedor enviandole tus medidas en cm.</p></details>
<details><summary>Las tallas de Shein son iguales a las de AliExpress?</summary><p>No siempre. Shein tiene tallaje mas estandarizado. En AliExpress cada vendedor tiene el suyo. Siempre revisa la tabla de medidas.</p></details>

<p>Antes de comprar desde ${pais}, conviene tambien <a href="${crossLinkPrecio}">${crossLinkPrecioLabel}</a> y revisar la <a href="${crossLinkAduana}">${crossLinkAduanaLabel}</a> aplicables a tu pedido.</p>

<p>Para la guia completa con todas las tallas (zapatos, sujetadores, guantes y mas paises), visita nuestra <a href="/escoger-tu-talla-ropa-china/">guia completa de tallas chinas</a>.</p>`;
}

// Argentina: sistema de numeros similares al europeo continental (36/38/40...)
// Tiendas tipicas: Falabella, Frabrega, Tienda Garbarino, Cencosud (mejor: Garbarino, Falabella, Daniel Cassin / pero usamos las mas conocidas)
const argentinaBody = buildBody({
  pais: 'Argentina',
  gentilicio: 'argentina',
  gentilicioP: 'argentinas',
  id: 'ar',
  tiendasLocales: 'Falabella, Cuspide o Garbarino',
  introExtra: 'Si compras en AliExpress, Shein o Temu desde Argentina, necesitas saber como convertir tu talla argentina a china. El sistema argentino usa numeros (36, 38, 40...) similares al europeo, mientras que China usa letras (S, M, L, XL...). Esta guia te da las equivalencias exactas.',
  consejoConvert: 'Tu talla numerica argentina + 2 suele acertar. Un 40 argentino equivale aprox. a L china.',
  tablaMujer: [
    { local: '36', china: 'S (China)' },
    { local: '38', china: 'M (China)' },
    { local: '40', china: 'L (China)' },
    { local: '42', china: 'XL (China)' },
    { local: '44', china: 'XXL (China)' },
  ],
  tablaHombre: [
    { local: '38', china: 'S (China)' },
    { local: '40', china: 'M (China)' },
    { local: '42', china: 'L (China)' },
    { local: '44', china: 'XL (China)' },
    { local: '46', china: 'XXL (China)' },
  ],
  datMujer:  { '36': 'S', '38': 'M', '40': 'L', '42': 'XL', '44': 'XXL' },
  datHombre: { '38': 'S', '40': 'M', '42': 'L', '44': 'XL', '46': 'XXL' },
  crossLinkPrecio: '/precio-aliexpress/peso-argentino/',
  crossLinkPrecioLabel: 'convertir precios al peso argentino',
  crossLinkAduana: '/aduana/china-a-argentina/',
  crossLinkAduanaLabel: 'aduana e impuestos de China a Argentina',
});

// Espana: sistema europeo continental — practicamente identico a Argentina en numerica.
// Tiendas: Zara, H&M, El Corte Ingles.
const espanaBody = buildBody({
  pais: 'Espana',
  gentilicio: 'espanola',
  gentilicioP: 'espanolas',
  id: 'es',
  tiendasLocales: 'Zara, H&M o El Corte Ingles',
  introExtra: 'Si compras en AliExpress, Shein o Temu desde Espana, necesitas saber como convertir tu talla espanola a china. El sistema espanol usa numeros (36, 38, 40...) propios del sistema europeo, mientras que China usa letras (S, M, L, XL...). Esta guia te da las equivalencias exactas.',
  consejoConvert: 'Tu talla numerica espanola + 2 suele acertar. Un 40 espanol equivale aprox. a L china.',
  tablaMujer: [
    { local: '36', china: 'S (China)' },
    { local: '38', china: 'M (China)' },
    { local: '40', china: 'L (China)' },
    { local: '42', china: 'XL (China)' },
    { local: '44', china: 'XXL (China)' },
  ],
  tablaHombre: [
    { local: '38', china: 'S (China)' },
    { local: '40', china: 'M (China)' },
    { local: '42', china: 'L (China)' },
    { local: '44', china: 'XL (China)' },
    { local: '46', china: 'XXL (China)' },
  ],
  datMujer:  { '36': 'S', '38': 'M', '40': 'L', '42': 'XL', '44': 'XXL' },
  datHombre: { '38': 'S', '40': 'M', '42': 'L', '44': 'XL', '46': 'XXL' },
  crossLinkPrecio: '/precio-aliexpress/euro/',
  crossLinkPrecioLabel: 'convertir precios al euro',
  crossLinkAduana: '/aduana/china-a-espana/',
  crossLinkAduanaLabel: 'aduana e impuestos de China a Espana',
});

const argentinaEntry = {
  slug: 'tallas-chinas-a-argentinas',
  title: 'Tallas Chinas a Argentinas 2026: Tabla de Equivalencias + Calculadora',
  seoTitle: 'Tallas Chinas a Argentinas 2026: Tabla + Calculadora',
  seoDescription: 'Convierte tu talla argentina a talla china al instante. Tabla Argentina-China para ropa, zapatos y accesorios en AliExpress, Shein y Temu.',
  body: argentinaBody,
  type: 'post',
  categories: ['Ropa'],
  date: '2026-06-07',
  featuredImage: null,
};

const espanaEntry = {
  slug: 'tallas-chinas-a-espanolas',
  title: 'Tallas Chinas a Espanolas 2026: Tabla de Equivalencias + Calculadora',
  seoTitle: 'Tallas Chinas a Espanolas 2026: Tabla + Calculadora',
  seoDescription: 'Convierte tu talla espanola a talla china al instante. Tabla Espana-China para ropa, zapatos y accesorios en AliExpress, Shein y Temu.',
  body: espanaBody,
  type: 'post',
  categories: ['Ropa'],
  date: '2026-06-07',
  featuredImage: null,
};

// Cargar, insertar, escribir.
const raw = fs.readFileSync(POSTS_PATH, 'utf8');
const posts = JSON.parse(raw);

// Idempotencia: si ya existen, fallamos en claro en vez de duplicar.
for (const existingSlug of ['tallas-chinas-a-argentinas', 'tallas-chinas-a-espanolas']) {
  if (posts.some(p => p.slug === existingSlug)) {
    console.error(`ERROR: ya existe un post con slug "${existingSlug}". Aborto.`);
    process.exit(1);
  }
}

posts.push(argentinaEntry, espanaEntry);

fs.writeFileSync(POSTS_PATH, JSON.stringify(posts, null, 2) + '\n');

console.log(`OK: insertados 2 posts. Total ahora: ${posts.length}`);
console.log(`  - tallas-chinas-a-argentinas (body ${argentinaBody.length} chars)`);
console.log(`  - tallas-chinas-a-espanolas  (body ${espanaBody.length} chars)`);
