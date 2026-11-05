// Ilustrações vetoriais (SVG) do trabalho "A Melancia": fatias, melancias inteiras, folhas, ícones e mapa.
import fs from 'node:fs';

let uid = 0;
const nid = (p) => `${p}${++uid}`;
const f = (n) => Number(n.toFixed(2));

export const COR = {
  v900: '#103a25', v700: '#1f6b3a', v500: '#3f9a4f', v300: '#9ccf86', v200: '#cfe6bd',
  r700: '#b81f3b', r600: '#d9304a', r500: '#ea4a63', r300: '#f6a3b0', cr: '#fbf6ea',
};

export const POLPAS = {
  vermelha: ['#f2677b', '#e0314b', '#f08d99'],
  amarela: ['#fbe27a', '#f4c430', '#f8dc86'],
  laranja: ['#f9b56a', '#ee8a3a', '#f6c08c'],
};

/* Fatia (meia-lua com a face cortada para cima). Coordenadas em unidades livres; o chamador define o viewBox. */
export function fatia({ cx, cy, R, polpa = 'vermelha', sementes = 'normal', brilho = true }) {
  const g = nid('gf');
  const [c0, c1, c2] = POLPAS[polpa];
  const semi = (r) => `M${f(cx - r)},${cy} A${f(r)},${f(r)} 0 0 0 ${f(cx + r)},${cy} Z`;
  let s = `<defs><radialGradient id="${g}" cx="${cx}" cy="${cy}" r="${R}" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="${c0}"/><stop offset=".62" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient></defs>`;
  s += `<path d="${semi(R)}" fill="#1b5a31"/>`;
  s += `<path d="${semi(R * 0.965)}" fill="#6db35a"/>`;
  s += `<path d="${semi(R * 0.925)}" fill="#eef5d6"/>`;
  s += `<path d="${semi(R * 0.865)}" fill="url(#${g})"/>`;
  if (brilho) s += `<path d="M${f(cx - R * 0.8)},${cy + R * 0.02} A${f(R * 0.8)},${f(R * 0.8)} 0 0 0 ${f(cx - R * 0.25)},${f(cy + R * 0.76)}" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="${f(R * 0.025)}" stroke-linecap="round"/>`;
  // sementes
  const an = (deg) => (deg * Math.PI) / 180;
  const pos = [];
  if (sementes !== 'nenhuma') {
    const aneis = [[0.34, [30, 62, 90, 118, 150]], [0.56, [22, 48, 74, 106, 132, 158]], [0.74, [34, 62, 90, 118, 146]]];
    aneis.forEach(([k, angs]) => angs.forEach((a) => pos.push([cx + R * k * Math.cos(an(a)), cy + R * k * Math.sin(an(a)), a])));
  }
  const keep = sementes === 'poucas' ? pos.filter((_, i) => i % 3 === 0) : pos;
  const sw = sementes === 'poucas' ? 0.04 : 0.055, sh = sementes === 'poucas' ? 0.022 : 0.03;
  const cor = sementes === 'poucas' ? '#f3ead0' : '#1d1815';
  keep.forEach(([x, y, a]) => {
    s += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(R * sw)}" ry="${f(R * sh)}" fill="${cor}" ${sementes === 'poucas' ? 'stroke="#c9b98f" stroke-width=".3"' : ''} transform="rotate(${f(a)} ${f(x)} ${f(y)})"/>`;
    if (sementes !== 'poucas') s += `<ellipse cx="${f(x - R * 0.012)}" cy="${f(y - R * 0.008)}" rx="${f(R * 0.016)}" ry="${f(R * 0.007)}" fill="#fff" fill-opacity=".35" transform="rotate(${f(a)} ${f(x)} ${f(y)})"/>`;
  });
  return s;
}

/* Melancia inteira listrada (círculo) */
export function inteira({ cx, cy, r, escura = '#1f6b3a', clara = '#7fc269' }) {
  const cp = nid('cp'), g = nid('gi');
  let s = `<defs><clipPath id="${cp}"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath>
    <radialGradient id="${g}" cx="${f(cx - r * 0.3)}" cy="${f(cy - r * 0.35)}" r="${f(r * 1.3)}" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="${clara}"/><stop offset=".55" stop-color="${escura}"/><stop offset="1" stop-color="#143f25"/></radialGradient></defs>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${g})"/>`;
  s += `<g clip-path="url(#${cp})" fill="none" stroke="#0f3a21" stroke-opacity=".55" stroke-linecap="round" stroke-width="${f(r * 0.09)}">`;
  for (let i = -3; i <= 3; i++) {
    const x = cx + i * r * 0.3;
    s += `<path d="M${f(x)},${f(cy - r)} Q${f(x + i * r * 0.22)},${cy} ${f(x)},${f(cy + r)}"/>`;
  }
  s += `</g><ellipse cx="${f(cx - r * 0.38)}" cy="${f(cy - r * 0.48)}" rx="${f(r * 0.22)}" ry="${f(r * 0.1)}" fill="#fff" fill-opacity=".22" transform="rotate(-35 ${f(cx - r * 0.38)} ${f(cy - r * 0.48)})"/>`;
  return s;
}

/* Folha */
export function folha({ x, y, len = 40, ang = 0, cor = '#3f9a4f', op = 1 }) {
  const w = len * 0.28;
  return `<g transform="translate(${x} ${y}) rotate(${ang})" opacity="${op}"><path d="M0,0 C${f(len * 0.3)},${f(-w)} ${f(len * 0.75)},${f(-w)} ${len},0 C${f(len * 0.75)},${f(w)} ${f(len * 0.3)},${f(w)} 0,0Z" fill="${cor}"/>
  <path d="M0,0 L${len * 0.92},0" stroke="#fff" stroke-opacity=".35" stroke-width="${f(len * 0.02)}"/></g>`;
}

/* Semente solta */
export function semente({ x, y, s = 3, ang = 0, cor = '#1d1815', op = 1 }) {
  return `<ellipse cx="${x}" cy="${y}" rx="${s}" ry="${f(s * 0.55)}" fill="${cor}" opacity="${op}" transform="rotate(${ang} ${x} ${y})"/>`;
}

/* Ícones de traço (viewBox 24) */
const I = {
  drop: '<path d="M12 3C12 3 5.5 10 5.5 14.5a6.5 6.5 0 0 0 13 0C18.5 10 12 3 12 3z"/>',
  heart: '<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.2 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/>',
  gut: '<path d="M6 5.5h9.5a3.2 3.2 0 0 1 0 6.4H8.5a3.2 3.2 0 0 0 0 6.4H18"/>',
  shield: '<path d="M12 3l7 3v5.2c0 4.8-3 8.3-7 9.8-4-1.5-7-5-7-9.8V6z"/><path d="M8.6 12l2.5 2.5 4.4-5"/>',
  spark: '<path d="M12 3c.8 4.2 2.8 6.2 7 7-4.2.8-6.2 2.8-7 7-.8-4.2-2.8-6.2-7-7 4.2-.8 6.2-2.8 7-7z"/><path d="M19 3v3M17.5 4.5h3"/>',
  atom: '<circle cx="12" cy="12" r="1.7"/><ellipse cx="12" cy="12" rx="9" ry="3.8"/><ellipse cx="12" cy="12" rx="9" ry="3.8" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.8" transform="rotate(120 12 12)"/>',
  glass: '<path d="M7 4h10l-1.2 15a2 2 0 0 1-2 1.8h-3.6a2 2 0 0 1-2-1.8z"/><path d="M7.4 9h9.2M13.5 4l2.2-2.4"/>',
  pop: '<rect x="7" y="3" width="10" height="13" rx="5"/><path d="M12 16v5M10 8h4"/>',
  jar: '<path d="M8 4.5h8v2.4H8z"/><path d="M7 6.9h10v11.6a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z"/><path d="M7 12h10"/>',
  candy: '<rect x="8" y="8" width="8" height="8" rx="2"/><path d="M8 12L3.5 8.5v7zM16 12l4.5-3.5v7z"/>',
  bowl: '<path d="M3 11h18a9 9 0 0 1-18 0z"/><circle cx="8.5" cy="7.4" r="2"/><circle cx="13.5" cy="6.4" r="2"/><circle cx="17" cy="8" r="1.6"/>',
  bottle: '<path d="M10 3h4v3h-4z"/><path d="M8 6h8v13.5a1.5 1.5 0 0 1-1.5 1.5h-5A1.5 1.5 0 0 1 8 19.5z"/><path d="M8 11.5h8"/>',
  factory: '<path d="M3 20.5V10l5 3v-3l5 3V5.5h4v15z"/><path d="M3 20.5h18M15.5 16h1M10 16.5h1"/>',
  flask: '<path d="M9.5 3h5M10.5 3v6.2L5.3 18a2 2 0 0 0 1.7 3h10a2 2 0 0 0 1.7-3L13.5 9.2V3"/><path d="M8 15h8"/>',
  trash: '<path d="M5 7h14M9.5 7V4.5h5V7M7 7l1 13h8l1-13"/><path d="M10.5 11v6M13.5 11v6"/>',
  leaf: '<path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14"/><path d="M5 19l7-7"/>',
  soil: '<path d="M3 19h18"/><path d="M5 14.5c2-2 4-2 7 0s5 2 7 0"/><path d="M12 10V5M9.5 7.5L12 5l2.5 2.5"/>',
  basket: '<path d="M4 10h16l-1.6 9.5H5.6z"/><path d="M8 10l3-6M16 10l-3-6"/>',
  wave: '<path d="M3 9c2.5-2 4.5-2 7 0s4.5 2 7 0 2-1.2 4-1.2"/><path d="M3 15c2.5-2 4.5-2 7 0s4.5 2 7 0 2-1.2 4-1.2"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  seed: '<path d="M12 3c4 3.5 5.5 8 4 12.5-.9 2.7-2.7 4.5-4 5.5-1.3-1-3.1-2.8-4-5.5C6.5 11 8 6.5 12 3z"/>',
  pin: '<path d="M12 21s-7-6.1-7-11.2A7 7 0 0 1 19 9.8C19 14.9 12 21 12 21z"/><circle cx="12" cy="10" r="2.6"/>',
  users: '<circle cx="9" cy="8.5" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9.5" r="2.6"/><path d="M16 14.2c.3-.1.7-.2 1-.2 2.2 0 4 1.8 4 4"/>',
  coin: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v10M9.5 9.5c0-1 1-1.6 2.5-1.6s2.5.6 2.5 1.6-1 1.5-2.5 1.9-2.5.9-2.5 1.9 1 1.6 2.5 1.6 2.5-.6 2.5-1.6"/>',
  warn: '<path d="M12 3.5l9.5 16.5h-19z"/><path d="M12 10v4.6M12 17.2v.2"/>',
  book: '<path d="M4 5.5C7 4.5 9.5 5 12 6.5c2.5-1.5 5-2 8-1v13c-3-1-5.5-.5-8 1-2.5-1.5-5-2-8-1z"/><path d="M12 6.5v13"/>',
};
export function icone(nome, tam = 24, extra = '') {
  return `<svg class="ic" viewBox="0 0 24 24" width="${tam}" height="${tam}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" ${extra}>${I[nome]}</svg>`;
}

/* Parentes da melancia (melão, pepino, abóbora) — ícones simples */
export function melao(s = 34) {
  return `<svg viewBox="0 0 40 40" width="${s}" height="${s}"><circle cx="20" cy="21" r="15" fill="#e6c56b"/><g stroke="#b89438" stroke-width=".9" fill="none" opacity=".8"><path d="M8 14c8 4 16 4 24 0M6 22c9 4 19 4 28 0M9 30c7 3 15 3 22 0M14 8c-3 8-3 17 0 26M22 6c-2 9-2 19 0 29M29 8c3 8 3 17 0 25"/></g></svg>`;
}
export function pepino(s = 34) {
  return `<svg viewBox="0 0 40 40" width="${s}" height="${s}"><g transform="rotate(-35 20 20)"><rect x="3" y="12" width="34" height="16" rx="8" fill="#4f9a45"/><rect x="3" y="12" width="34" height="16" rx="8" fill="none" stroke="#2f6e2c" stroke-width="1"/><g fill="#8cc774"><circle cx="10" cy="17" r="1"/><circle cx="17" cy="23" r="1"/><circle cx="24" cy="16" r="1"/><circle cx="30" cy="22" r="1"/></g></g></svg>`;
}
export function abobora(s = 34) {
  return `<svg viewBox="0 0 40 40" width="${s}" height="${s}"><ellipse cx="20" cy="23" rx="16" ry="12.5" fill="#ef9a3c"/><g fill="none" stroke="#c9731d" stroke-width="1" opacity=".75"><path d="M20 10.5c-6 4-6 21 0 25M20 10.5c6 4 6 21 0 25M20 10.5c-12 3-12 22 0 25M20 10.5c12 3 12 22 0 25"/></g><path d="M20 11c0-4 1-6 4-7" stroke="#3f7a2e" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>`;
}

/* Mapa do Brasil (@svg-maps/brazil, CC BY 4.0) com os estados citados no trabalho em destaque */
export function mapaBrasil(caminhoSvg, destacados) {
  const bruto = fs.readFileSync(caminhoSvg, 'utf8');
  const paths = [...bruto.matchAll(/<path\s+id="([a-z]{2})"\s+aria-label="([^"]+)"\s+d="([^"]+)"/g)];
  if (paths.length !== 27) throw new Error(`Mapa: esperava 27 UFs, achei ${paths.length}`);
  const alvo = new Set(destacados);
  const corpo = paths.map(([, uf, nome, d]) =>
    `<path class="uf${alvo.has(uf) ? ' hl' : ''}" data-uf="${uf}" d="${d}" fill="${alvo.has(uf) ? COR.r600 : COR.v200}" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"><title>${nome}</title></path>`).join('');
  return `<svg viewBox="0 0 613 639" role="img" aria-label="Mapa do Brasil com os estados produtores citados em destaque">${corpo}</svg>`;
}
