// Gera o PDF "A melancia e a saúde dos rins"
// Uso: node src/construir.mjs      Saída: melancia_e_os_rins.pdf (+ saida/documento.html)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { PDFDocument, PDFName, PDFBool } from 'pdf-lib';
import { fatia, inteira, folha, semente, icone, rimForma, diagramaRenal, copos, COR } from './arte.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SAIDA_DIR = path.join(RAIZ, 'saida');
const SAIDA_HTML = path.join(SAIDA_DIR, 'documento.html');
const SAIDA_PDF = path.join(RAIZ, 'melancia_e_os_rins.pdf');

/* ------------------------------------------------------------- fotos (só no final) */
let MAN = {};
try { MAN = JSON.parse(fs.readFileSync(path.join(RAIZ, 'fotos', 'fotos.json'), 'utf8')); } catch { /* sem fotos */ }
const faltando = [];
function foto(slug, legenda) {
  const m = MAN[slug];
  if (m && fs.existsSync(path.join(RAIZ, 'fotos', m.arquivo))) {
    const pos = m.posicao ? `style="object-position:${m.posicao}"` : '';
    return `<figure><img src="${pathToFileURL(path.join(RAIZ, 'fotos', m.arquivo))}" alt="${legenda}" ${pos}></figure>`;
  }
  faltando.push(slug);
  return '<figure class="ph">Fotografia pendente</figure>';
}

/* ------------------------------------------------------------- estrutura */
let n = 0;
function pagina(secao, html) {
  n += 1;
  return `<section class="page"><div class="cab"><span class="m"><i></i>A melancia e a saúde dos rins</span><span>${secao}</span></div>
  <div class="content">${html}</div><div class="rod">${n}</div></section>`;
}
const sec = (h, st = '') => `<div class="sec"${st ? ` style="${st}"` : ''}>${h}</div>`;
const titulo = (h) => `<h1>${h}</h1><span class="regra"></span>`;
const marcador = (num, etiqueta) => `<div class="item"><span class="nn">${num}</span><span class="et">${etiqueta}</span></div>`;
const svg = (vb, w, corpo, extra = '') => `<svg viewBox="${vb}" width="${w}" xmlns="http://www.w3.org/2000/svg" ${extra}>${corpo}</svg>`;

const rosca = (tam = '40mm') => `<svg viewBox="0 0 60 60" width="${tam}" height="${tam}">
  <circle cx="30" cy="30" r="22" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="8"/>
  <circle cx="30" cy="30" r="22" fill="none" stroke="${COR.r500}" stroke-width="8" stroke-linecap="round"
    stroke-dasharray="${(2 * Math.PI * 22 * 0.92).toFixed(2)} ${(2 * Math.PI * 22).toFixed(2)}" transform="rotate(-90 30 30)"/>
  <text x="30" y="32" text-anchor="middle" font-family="Playfair" font-weight="900" font-size="15" fill="#fbf6ea">92%</text>
  <text x="30" y="40" text-anchor="middle" font-family="Source Sans" font-weight="600" font-size="4.6" letter-spacing=".6" fill="#cfe6bd">DE ÁGUA</text></svg>`;

const seta = '<span class="fa"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4l8 8-8 8"/></svg></span>';
const fluxo = () => {
  const passos = [['drop', 'Água', '92% da fruta'], ['wave', 'Hidratação', 'do organismo'], ['rim', 'Filtragem', 'do sangue'], ['ciclo', 'Eliminação', 'pela urina']];
  return `<div class="fluxo">${passos.map(([i, a, b], k) =>
    `${k ? seta : ''}<div class="fp"><span class="fi">${icone(i, 24)}</span><b>${a}</b><small>${b}</small></div>`).join('')}</div>`;
};

/* ================================================================== PÁGINAS */
function montar() {
  n = 0; faltando.length = 0;
  const P = [];

  /* ---- 1. Capa ---- */
  n += 1;
  const arteCapa = `
    <g opacity=".95">${folha({ x: 8, y: 138, len: 62, ang: -26, cor: '#2f7d44' })}${folha({ x: 202, y: 134, len: 64, ang: 206, cor: '#2f7d44' })}</g>
    <g transform="rotate(-4 105 92)">${fatia({ cx: 105, cy: 86, R: 84 })}</g>
    <g opacity=".17">${rimForma({ x: 150, y: 14, alt: 54, cor: 'none', borda: '#cfe6bd' })}</g>
    ${[[26, 62, 2.2, 20], [40, 86, 1.7, -30], [186, 66, 2.4, 40], [172, 46, 1.7, 10], [58, 34, 1.5, 30], [150, 30, 1.6, -40], [100, 26, 1.4, 15]]
      .map(([x, y, sz, a]) => semente({ x, y, s: sz, ang: a, cor: '#cfe6bd', op: .5 })).join('')}`;
  P.push(`<section class="page capa">
    <div class="painel"><svg class="arte" viewBox="0 0 210 170" preserveAspectRatio="xMidYMid slice">${arteCapa}</svg>
      <div class="tit"><div class="kick">Trabalho escolar</div>
        <h1>A MELANCIA<br>E A SAÚDE<br><span class="r">DOS RINS</span></h1></div></div>
    <div class="base">
      <p class="sub">Hidratação, funcionamento dos rins e cuidados com o consumo</p>
      <div class="marcas">
        <div><span class="ii" style="background:var(--a100);color:var(--a600)">${icone('drop', 22)}</span><b>92% de água</b><small>na composição da fruta</small></div>
        <div><span class="ii" style="background:var(--r100);color:var(--r600)">${icone('rim', 22)}</span><b>6 perguntas</b><small>respondidas no trabalho</small></div>
        <div><span class="ii" style="background:var(--v100);color:var(--v700)">${icone('medico', 22)}</span><b>Com ressalvas</b><small>não substitui orientação médica</small></div>
      </div>
    </div></section>`);

  /* ---- 2. Introdução ---- */
  const perguntas = [
    'Ajuda no funcionamento dos rins', 'Pode ajudar na prevenção de pedras nos rins',
    'Contém potássio', 'Ajuda na eliminação de resíduos',
    'A melancia limpa os rins?', 'Quem tem problemas nos rins pode comer melancia?',
  ];
  P.push(pagina('Introdução', `
    ${titulo('A <em>melancia</em> e a saúde dos rins')}
    ${sec(`<p class="lead">A melancia pode contribuir para a saúde dos rins principalmente por possuir aproximadamente 92% de água. Essa característica ajuda na hidratação do organismo e na produção de urina, processo importante para o funcionamento do sistema urinário.</p>`, 'margin-bottom:5mm')}
    ${sec(fluxo(), 'margin-bottom:7mm')}
    ${sec(`<h2>O que este trabalho responde</h2>
      <div class="idx">${perguntas.map((q, i) => `<div><b>${String(i + 1).padStart(2, '0')}</b><span>${q}</span></div>`).join('')}</div>`)}
    <div style="flex:1;display:flex;align-items:flex-end;justify-content:center;padding-top:6mm">${svg('0 0 200 104', '96mm', fatia({ cx: 100, cy: 8, R: 92 }))}</div>`));

  /* ---- 3. Item 1 ---- */
  P.push(pagina('Funcionamento dos rins', `
    ${marcador('01', 'Primeiro ponto')}
    ${titulo('Ajuda no <em>funcionamento</em> dos rins')}
    ${sec(`<p class="lead">A água presente na melancia contribui para manter o organismo hidratado. Quando estamos bem hidratados, os rins conseguem realizar melhor a filtragem do sangue e a eliminação de resíduos pela urina.</p>`, 'margin-bottom:5mm')}
    ${sec(`<div class="fig">${diagramaRenal()}<span class="cap">Esquema do percurso descrito no texto: o sangue com resíduos passa pelos rins, o sangue filtrado segue adiante e os resíduos saem pela urina. A água da melancia entra nesse processo pela hidratação.</span></div>`, 'margin-bottom:5mm')}
    <div class="destaque" style="padding:5mm 6mm">${rosca('34mm')}
      <span>Cerca de <b style="font-size:14pt;display:inline">92%</b> da melancia é água — é essa característica que liga a fruta à hidratação do organismo.</span></div>`));

  /* ---- 4. Item 2 ---- */
  P.push(pagina('Pedras nos rins', `
    ${marcador('02', 'Segundo ponto')}
    ${titulo('Pode ajudar na prevenção de <em>pedras</em> nos rins')}
    ${sec(`<p class="lead">Beber água suficiente ajuda a deixar a urina menos concentrada, diminuindo a possibilidade de formação de alguns tipos de cálculos renais (pedras nos rins). Como possui muita água, a melancia pode contribuir para essa hidratação.</p>`, 'margin-bottom:5mm')}
    ${sec(`<div class="fig">${copos()}<span class="cap">Quanto mais água, menos concentrada fica a urina. O texto fala em diminuir a possibilidade de formação de <b>alguns tipos</b> de cálculos — não em impedir que eles se formem.</span></div>`, 'margin-bottom:5mm')}
    ${sec(`<div class="quadro creme"><div class="nota-lateral" style="border:0;padding:0"><div style="color:var(--r600)">${icone('warn', 30)}</div>
      <div><h3>Atenção ao verbo</h3><p style="margin:0">O texto diz que a melancia <b>pode contribuir</b> para a hidratação. Contribuir para a hidratação não é o mesmo que prevenir ou tratar pedras nos rins.</p></div></div></div>`)}`));

  /* ---- 5. Itens 3 e 4 ---- */
  P.push(pagina('Potássio e resíduos', `
    ${marcador('03', 'Terceiro ponto')}
    ${titulo('Contém <em>potássio</em>')}
    ${sec(`<div style="display:grid;grid-template-columns:1fr 46mm;gap:6mm;align-items:center">
      <p class="lead" style="margin:0">A melancia possui potássio, um mineral importante para o funcionamento dos músculos, dos nervos e para o equilíbrio de líquidos no organismo.</p>
      <div class="quadro" style="text-align:center;padding:4.4mm"><div style="font-family:'Playfair';font-weight:900;font-size:34pt;line-height:1;color:var(--v700)">K</div>
        <small style="font-size:10.4pt;color:var(--cz)">potássio</small></div></div>`, 'margin-bottom:4.4mm')}
    ${sec(`<div class="alerta"><div class="x">${icone('warn', 30)}</div><div>
      <b>Entretanto, pessoas com problemas renais podem precisar controlar o consumo desse mineral.</b></div></div>`, 'margin-bottom:8mm')}
    ${marcador('04', 'Quarto ponto')}
    ${titulo('Ajuda na eliminação de <em>resíduos</em>')}
    ${sec(`<p class="lead">Os rins filtram o sangue e eliminam substâncias que o organismo não precisa por meio da urina. A hidratação adequada ajuda nesse processo natural.</p>`, 'margin-bottom:4.4mm')}
    <div class="quadro verde"><div class="nota-lateral verde" style="border:0;padding:0"><div style="color:var(--v700)">${icone('ciclo', 30)}</div>
      <div><h3>Um processo natural do corpo</h3><p style="margin:0">A eliminação de resíduos é feita pelos próprios rins. A hidratação ajuda nesse processo — ela não cria nem substitui o processo.</p></div></div></div>
    <div style="flex:1;display:flex;align-items:flex-end;justify-content:center;padding-top:3mm">${svg('0 0 200 62', '86mm', `${inteira({ cx: 62, cy: 32, r: 26 })}${fatia({ cx: 140, cy: 6, R: 36 })}${folha({ x: 40, y: 12, len: 26, ang: -40, cor: '#3f9a4f' })}`)}</div>`));

  /* ---- 6. Item 5 ---- */
  P.push(pagina('Mito e realidade', `
    ${marcador('05', 'Quinto ponto')}
    ${titulo('A <em>melancia</em> limpa os rins?')}
    ${sec(`<div class="duo">
      <div class="pn no"><small>Crença popular</small><h2>O que muita gente diz</h2>
        <p>Existe uma crença popular de que a melancia limpa os rins.</p></div>
      <div class="pn ok"><small>O que realmente acontece</small><h2>O papel da hidratação</h2>
        <p>O que acontece é que sua quantidade de água contribui para a hidratação, ajudando os rins a desempenharem suas funções.</p></div>
    </div>`, 'margin-bottom:6mm')}
    ${sec(`<div class="alerta"><div class="x">${icone('x', 30)}</div><div>
      <b>Na realidade, ela não realiza uma limpeza especial nem remove pedras já existentes.</b></div></div>`, 'margin-bottom:6mm')}
    <div style="flex:1;display:flex;align-items:flex-end;justify-content:center">${svg('0 0 200 92', '104mm',
      `${folha({ x: 30, y: 80, len: 40, ang: -22, cor: '#3f9a4f' })}${folha({ x: 170, y: 80, len: 40, ang: 202, cor: '#3f9a4f' })}${inteira({ cx: 100, cy: 54, r: 32 })}${inteira({ cx: 48, cy: 66, r: 18 })}${inteira({ cx: 152, cy: 66, r: 18 })}`)}</div>`));

  /* ---- 7. Item 6 ---- */
  P.push(pagina('Quem pode comer', `
    ${marcador('06', 'Sexto ponto')}
    ${titulo('Quem tem problemas nos rins pode comer <em>melancia</em>?')}
    ${sec(`<div class="quadro azul"><div class="nota-lateral azul" style="border:0;padding:0"><div style="color:var(--a600)">${icone('rim', 32)}</div>
      <div><h3 style="font-size:15pt">Depende da condição de saúde</h3>
      <p style="margin:0">Pessoas com doença renal podem precisar controlar a quantidade de líquidos e potássio consumidos.</p></div></div></div>`, 'margin-bottom:6mm')}
    ${sec(`<div class="cards">
      <div class="card az"><div class="ib">${icone('drop', 26)}</div><h3>Líquidos</h3><p>A quantidade de líquidos pode precisar de controle — e a melancia é quase toda água.</p></div>
      <div class="card"><div class="ib">${icone('mineral', 26)}</div><h3>Potássio</h3><p>O potássio da fruta também entra na conta de quem precisa controlar esse mineral.</p></div>
    </div>`, 'margin-bottom:6mm')}
    ${sec(`<div class="alerta"><div class="x">${icone('medico', 32)}</div><div>
      <b>Por isso, devem seguir as orientações de um médico ou nutricionista.</b>
      <p>Este trabalho é escolar e não substitui a avaliação de um profissional de saúde.</p></div></div>`)}
    <div style="flex:1;display:flex;align-items:flex-end;justify-content:center;padding-top:5mm">${svg('0 0 200 104', '72mm', fatia({ cx: 100, cy: 8, R: 92 }))}</div>`));

  /* ---- 8. Síntese ---- */
  P.push(pagina('Síntese', `
    ${titulo('O que o trabalho <em>mostrou</em>')}
    ${sec(`<p class="lead">Reunindo os seis pontos, a relação entre a melancia e os rins passa sempre pelo mesmo caminho: a água da fruta ajuda na hidratação, e a hidratação ajuda os rins a fazerem o trabalho que já é deles.</p>`, 'margin-bottom:6mm')}
    ${sec(`<div class="sint"><h2>Em resumo</h2><ul>
      <li>A melancia tem aproximadamente 92% de água, o que ajuda na hidratação e na produção de urina.</li>
      <li>Bem hidratados, os rins filtram melhor o sangue e eliminam resíduos pela urina.</li>
      <li>Urina menos concentrada diminui a possibilidade de formação de alguns tipos de cálculos renais.</li>
      <li>A fruta contém potássio, mineral que pessoas com problemas renais podem precisar controlar.</li>
      <li>A melancia não limpa os rins nem remove pedras já existentes.</li>
      <li>Quem tem doença renal deve seguir as orientações de um médico ou nutricionista.</li>
    </ul></div>`, 'margin-bottom:6mm')}
    <div style="flex:1;display:flex;align-items:flex-end;justify-content:center">${svg('0 0 200 104', '100mm',
      `${folha({ x: 6, y: 98, len: 46, ang: -22, cor: '#3f9a4f' })}${folha({ x: 194, y: 98, len: 46, ang: 202, cor: '#3f9a4f' })}${fatia({ cx: 100, cy: 8, R: 92 })}`)}</div>`));

  /* ---- 9. Imagens (fotos só no final) ---- */
  const gal = [['melancia-polpa', 'Melancia e sua polpa', 'A polpa é a parte da fruta consumida in natura.'],
               ['variedades', 'Variedade de polpa amarela', 'Outra variedade da mesma fruta.'],
               ['sementes', 'Polpa e sementes', 'Detalhe da polpa com as sementes escuras.'],
               ['casca', 'Casca da melancia', 'A parte branca e a parte verde externa da casca.']];
  P.push(pagina('Imagens', `
    ${titulo('Imagens da <em>fruta</em>')}
    ${sec(`<p>Fotografias da melancia, tema deste trabalho. As imagens aparecem no final para não interromper a leitura do conteúdo.</p>`, 'margin-bottom:6mm')}
    <div class="galeria">${gal.map(([s, t, c]) => `<div class="gc">${foto(s, t)}<h3>${t}</h3><p>${c}</p></div>`).join('')}</div>`));

  /* ---- 10. Referências ---- */
  P.push(pagina('Referências', `
    ${titulo('<em>Referências</em> e créditos')}
    ${sec(`<h2>Fontes consultadas</h2>
      <p class="nota" style="margin-bottom:4mm">O conteúdo científico deste trabalho é o do texto produzido pelo grupo. Nenhuma fonte foi informada junto com esse texto e nenhuma foi inventada aqui. Use as linhas abaixo para registrar as fontes realmente consultadas (autor, título, instituição, ano e endereço eletrônico).</p>
      <div class="linha-fld"><i class="fld" data-name="fonte1"></i></div>
      <div class="linha-fld"><i class="fld" data-name="fonte2"></i></div>
      <div class="linha-fld"><i class="fld" data-name="fonte3"></i></div>
      <div class="linha-fld"><i class="fld" data-name="fonte4"></i></div>`, 'margin-bottom:7mm')}
    ${sec(`<div class="quadro creme"><h3>Sugestão de onde pesquisar</h3>
      <p class="nota" style="margin:0">Para um tema de saúde, prefira instituições de pesquisa e órgãos oficiais, como universidades públicas, sociedades médicas e nutricionais e órgãos de saúde. Confira sempre a data da publicação.</p></div>`, 'margin-bottom:7mm')}
    ${sec(`<h2>Créditos de materiais</h2>
      <p class="cred"><b>Ilustrações, esquemas e ícones:</b> vetoriais, criados para este trabalho.<br>
      <b>Fotografias:</b> fornecidas pelo grupo; autoria não identificada.<br>
      <b>Tipografia:</b> Playfair Display e Source Sans 3 (SIL Open Font License, Google Fonts).</p>`)}
    <div style="flex:1;display:flex;align-items:flex-end;justify-content:center;padding-top:6mm">${svg('0 0 200 80', '72mm', `${folha({ x: 62, y: 30, len: 34, ang: -150, cor: '#3f9a4f' })}${folha({ x: 138, y: 30, len: 34, ang: -30, cor: '#2f7d44' })}${inteira({ cx: 100, cy: 46, r: 30 })}`)}</div>`));

  return P;
}

/* ================================================================== RENDER */
const css = fs.readFileSync(path.join(RAIZ, 'src', 'estilo.css'), 'utf8')
  .replaceAll("url('../fontes/", `url('${pathToFileURL(path.join(RAIZ, 'fontes'))}/`);
fs.mkdirSync(SAIDA_DIR, { recursive: true });
const paginas = montar();
fs.writeFileSync(SAIDA_HTML, `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<title>A melancia e a saúde dos rins</title><style>${css}</style></head><body>${paginas.join('\n')}</body></html>`);

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('file://' + SAIDA_HTML, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);

const relatorio = await page.evaluate(() => {
  const mm = (px) => Math.round((px * 25.4) / 96);
  return [...document.querySelectorAll('.page')].map((pg, i) => {
    const c = pg.querySelector('.content');
    if (!c) return { pagina: i + 1, capa: true };
    const cr = c.getBoundingClientRect();
    let maxB = cr.top;
    c.querySelectorAll(':scope > *').forEach((el) => { maxB = Math.max(maxB, el.getBoundingClientRect().bottom); });
    return { pagina: i + 1, ocupacao: Math.round(((maxB - cr.top) / cr.height) * 100), estouroPx: c.scrollHeight - c.clientHeight,
      blocos: [...c.querySelectorAll(':scope > *')].map((el) => mm(el.getBoundingClientRect().height)) };
  });
});
const campos = await page.evaluate(() => [...document.querySelectorAll('.fld')].map((el) => {
  const pg = el.closest('.page'); const pr = pg.getBoundingClientRect(); const r = el.getBoundingClientRect();
  return { nome: el.dataset.name, pagina: [...document.querySelectorAll('.page')].indexOf(pg), x: r.left - pr.left, y: r.top - pr.top, w: r.width, h: r.height };
}));
console.log('Relatório de layout:');
let ok = true;
for (const r of relatorio) {
  if (r.capa) { console.log(`  p${r.pagina}: capa`); continue; }
  const fl = r.estouroPx > 1 ? '  <<< ESTOURO' : '';
  if (fl) ok = false;
  console.log(`  p${r.pagina}: ${r.ocupacao}%${fl}  (blocos mm: ${r.blocos.join(' + ')})`);
}
const bruto = await page.pdf({ width: '210mm', height: '297mm', printBackground: true, preferCSSPageSize: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
await browser.close();

const doc = await PDFDocument.load(bruto);
const form = doc.getForm();
const pgs = doc.getPages();
for (const c of campos) {
  const pg = pgs[c.pagina]; const H = pg.getHeight();
  const campo = form.createTextField(c.nome);
  campo.addToPage(pg, { x: c.x * 0.75, y: H - (c.y + c.h) * 0.75, width: c.w * 0.75, height: c.h * 0.75, borderWidth: 0 });
  campo.setFontSize(11);
}
form.acroForm.dict.set(PDFName.of('NeedAppearances'), PDFBool.True);
doc.setTitle('A melancia e a saúde dos rins');
fs.writeFileSync(SAIDA_PDF, await doc.save());
console.log(`PDF gerado: ${path.relative(RAIZ, SAIDA_PDF)} (${paginas.length} páginas; ${campos.length} campos editáveis)`);
if (faltando.length) console.log('Fotografias pendentes:', faltando.join(', '));
if (!ok) { console.error('Há páginas com estouro de conteúdo.'); process.exitCode = 1; }
