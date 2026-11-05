// Gera o PDF "A MELANCIA: Composição Química, Benefícios e Importância no Brasil"
// Uso: node src/construir.mjs      Saída: a_melancia.pdf (+ saida/documento.html)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { PDFDocument, PDFName, PDFBool } from 'pdf-lib';
import { fatia, inteira, folha, semente, icone, melao, pepino, abobora, mapaBrasil, COR } from './arte.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SAIDA_DIR = path.join(RAIZ, 'saida');
const SAIDA_HTML = path.join(SAIDA_DIR, 'documento.html');
const SAIDA_PDF = path.join(RAIZ, 'a_melancia.pdf');

/* ------------------------------------------------------------------ fotos (somente no final) */
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
  return `<figure class="ph">Fotografia pendente</figure>`;
}

/* ------------------------------------------------------------------ página */
let n = 0;
function pagina(secao, html) {
  n += 1;
  return `<section class="page"><div class="cab"><span class="m"><i></i>A Melancia</span><span>${secao}</span></div>
  <div class="content">${html}</div><div class="rod">${n}</div></section>`;
}
const sec = (h, st = '') => `<div class="sec"${st ? ` style="${st}"` : ''}>${h}</div>`;
const titulo = (h) => `<h1>${h}</h1><span class="regra"></span>`;
const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
const Q = (t) => `<span class="quim">${t}</span>`;

const svg = (vb, w, corpo, extra = '') => `<svg viewBox="${vb}" width="${w}" xmlns="http://www.w3.org/2000/svg" ${extra}>${corpo}</svg>`;

/* ================================================================== PÁGINAS */
function montar() {
  n = 0; faltando.length = 0;
  const P = [];

  /* ---- 1. Capa ---- */
  n += 1;
  const arteCapa = `
    <g opacity=".95">${folha({ x: 12, y: 150, len: 70, ang: -28, cor: '#2f7d44' })}${folha({ x: 5, y: 170, len: 58, ang: -52, cor: '#3f9a4f', op: .9 })}
    ${folha({ x: 205, y: 142, len: 72, ang: 208, cor: '#2f7d44' })}${folha({ x: 208, y: 168, len: 58, ang: 230, cor: '#3f9a4f', op: .9 })}</g>
    <g transform="rotate(-5 105 100)">${fatia({ cx: 105, cy: 92, R: 96 })}</g>
    ${[[22, 70, 2.4, 20], [34, 98, 1.8, -30], [188, 74, 2.6, 40], [176, 52, 1.8, 10], [14, 118, 2, 60], [198, 112, 2, -20], [60, 36, 1.6, 30], [152, 30, 1.7, -40]].map(([x, y, s, a]) => semente({ x, y, s, ang: a, cor: '#cfe6bd', op: .55 })).join('')}`;
  P.push(`<section class="page capa">
    <div class="painel"><svg class="arte" viewBox="0 0 210 182" preserveAspectRatio="xMidYMid slice">${arteCapa}</svg>
      <div class="tit"><div class="kick">Trabalho escolar</div><h1><span>A <span style="display:inline;color:var(--r500)">MELANCIA</span></span></h1></div></div>
    <div class="base"><p class="sub">Composição Química, Benefícios e Importância no Brasil</p>
      <div class="campos">
        <div class="campo largo"><label>Nome do aluno</label><i class="fld" data-name="aluno"></i></div>
        <div class="campo largo"><label>Escola</label><i class="fld" data-name="escola"></i></div>
        <div class="campo"><label>Professor(a)</label><i class="fld" data-name="professor"></i></div>
        <div class="campo"><label>Turma</label><i class="fld" data-name="turma"></i></div>
        <div class="campo"><label>Disciplina</label><i class="fld" data-name="disciplina"></i></div>
        <div class="campo"><label>Cidade e ano</label><i class="fld" data-name="cidade_ano"></i></div>
      </div></div></section>`);

  /* ---- 2. Introdução ---- */
  P.push(pagina('Introdução', `
    ${titulo('Introdução')}
    ${sec(`<p class="lead">A melancia é uma fruta muito consumida no Brasil, principalmente em épocas de calor, por ser refrescante, saborosa e possuir grande quantidade de água. Seu nome científico é <span class="sci">Citrullus lanatus</span> e ela pertence à família das cucurbitáceas, a mesma do melão, do pepino e da abóbora.</p>
      <p>Além de ser utilizada na alimentação, a melancia possui diversas substâncias importantes para o organismo, apresenta valor econômico para a agricultura brasileira e pode ser aproveitada de diferentes maneiras, desde a polpa até a casca e as sementes.</p>`, 'margin-bottom:8mm')}
    ${sec(`<div class="ficha">
      <div class="fcard verm"><small>Nome científico</small><b class="big sci">Citrullus lanatus</b></div>
      <div class="fcard verde"><small>Família botânica</small><b class="big">Cucurbitáceas</b>
        <div class="parentes"><div>${melao(34)}Melão</div><div>${pepino(34)}Pepino</div><div>${abobora(34)}Abóbora</div></div></div>
    </div>`, 'margin-bottom:5mm')}
    ${sec(`<div class="ficha" style="grid-template-columns:repeat(3,1fr)">
      <div class="fcard" style="text-align:center">${icone('wave', 26, 'style="color:var(--v700)"')}<b style="display:block;margin-top:1mm;font-weight:700;color:var(--v800)">Refrescante</b></div>
      <div class="fcard" style="text-align:center">${icone('heart', 26, 'style="color:var(--r600)"')}<b style="display:block;margin-top:1mm;font-weight:700;color:var(--v800)">Saborosa</b></div>
      <div class="fcard" style="text-align:center">${icone('drop', 26, 'style="color:var(--v700)"')}<b style="display:block;margin-top:1mm;font-weight:700;color:var(--v800)">Grande quantidade de água</b></div>
    </div>`, 'margin-bottom:8mm')}
    <div style="flex:1;display:flex;align-items:flex-end;justify-content:center;margin-bottom:0">
      ${svg('0 0 200 104', '145mm', `${folha({ x: 6, y: 96, len: 46, ang: -20, cor: '#3f9a4f' })}${folha({ x: 194, y: 96, len: 46, ang: 200, cor: '#3f9a4f' })}${fatia({ cx: 100, cy: 8, R: 92 })}`)}
    </div>`));

  /* ---- 3. Origem ---- */
  P.push(pagina('Origem', `
    ${titulo('Origem da <em>melancia</em>')}
    <div class="destaque"><b>5 mil anos</b><span>de registros de consumo da melancia, inclusive no Egito Antigo.</span></div>
    ${sec(`<div class="tl">
      <div class="no"><small>África</small><p class="lead">A melancia é originária da África, especialmente de regiões próximas ao deserto de Kalahari.</p></div>
      <div class="no"><small>Registros históricos</small><p class="lead">Existem registros de seu consumo há aproximadamente 5 mil anos, inclusive no Egito Antigo.</p></div>
      <div class="no"><small>Chegada ao Brasil</small><p class="lead">No Brasil, a fruta foi introduzida por africanos escravizados e, com o passar do tempo, passou a ser cultivada em diversas regiões do país.</p></div>
      <div class="no"><small>Hoje</small><p class="lead">Atualmente, é uma das frutas mais populares da alimentação brasileira.</p></div>
    </div>`, 'margin-bottom:6mm')}
    <div style="flex:1;display:flex;align-items:flex-end;justify-content:space-between;gap:6mm;margin-bottom:0">
      ${svg('0 0 70 70', '52mm', inteira({ cx: 35, cy: 38, r: 28 }) + folha({ x: 33, y: 11, len: 20, ang: -60, cor: '#3f9a4f' }))}
      ${svg('0 0 200 104', '110mm', fatia({ cx: 100, cy: 8, R: 92 }))}
    </div>`));

  /* ---- 4. Tipos ---- */
  const tipos = [
    ['Melancia tradicional', 'possui casca verde, polpa vermelha e sementes escuras.', fatia({ cx: 60, cy: 8, R: 52 }), '#fff'],
    ['Melancia sem sementes', 'apresenta poucas sementes desenvolvidas ou sementes pequenas e macias.', fatia({ cx: 60, cy: 8, R: 52, sementes: 'poucas' }), '#fff'],
    ['Melancia amarela', 'possui polpa amarela e sabor geralmente mais suave.', fatia({ cx: 60, cy: 8, R: 52, polpa: 'amarela' }), '#fff'],
    ['Melancia mini', 'apresenta tamanho menor, sendo mais fácil de transportar e armazenar.', `${inteira({ cx: 34, cy: 30, r: 17 })}${fatia({ cx: 88, cy: 20, R: 26 })}`, '#fff'],
    ['Melancia de polpa alaranjada', 'possui coloração diferente devido à presença de outros pigmentos naturais.', fatia({ cx: 60, cy: 8, R: 52, polpa: 'laranja', sementes: 'normal' }), '#fff'],
  ];
  P.push(pagina('Tipos', `
    ${titulo('Tipos de <em>melancia</em>')}
    ${sec(`<p class="lead">Existem diferentes variedades de melancia, que apresentam diferenças no tamanho, na cor da polpa, no formato e na presença de sementes.</p>`, 'margin-bottom:6mm')}
    <div>${tipos.map(([nome, desc, art]) => `<div class="tipo"><div class="il" style="background:var(--cr2)">${svg('0 0 120 66', '100%', art, 'style="max-height:28mm"')}</div>
      <div class="tx"><h3>${nome}</h3><p>${cap(desc)}</p></div></div>`).join('')}</div>`));

  /* ---- 5. Composição química ---- */
  const cA = { C: '#2b3a31', H: '#d3dcc2', O: '#d9304a', N: '#3d7bbf', K: '#3f9a4f' };
  const barra = (els) => `<div class="atomos">${els.map(([e, k]) => `<i style="flex:${k};background:${cA[e]}"></i>`).join('')}</div>`;
  const subs = [
    ['Glicose', 'C₆H₁₂O₆', 'açúcar natural utilizado pelo organismo como fonte de energia.', barra([['C', 6], ['H', 12], ['O', 6]])],
    ['Frutose', 'C₆H₁₂O₆', 'açúcar encontrado naturalmente nas frutas.', barra([['C', 6], ['H', 12], ['O', 6]])],
    ['Licopeno', 'C₄₀H₅₆', 'pigmento responsável pela coloração avermelhada e que possui ação antioxidante.', barra([['C', 40], ['H', 56]])],
    ['Vitamina C', '', 'participa do funcionamento do sistema imunológico e da formação de colágeno.', ''],
    ['Potássio', 'K', 'mineral importante para o funcionamento dos músculos e dos nervos.', barra([['K', 1]])],
    ['Citrulina', 'C₆H₁₃N₃O₃', 'aminoácido que participa de processos relacionados à circulação sanguínea.', barra([['C', 6], ['H', 13], ['N', 3], ['O', 3]])],
  ];
  const rosca = `<svg viewBox="0 0 60 60" width="40mm" height="40mm"><circle cx="30" cy="30" r="22" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="8"/>
    <circle cx="30" cy="30" r="22" fill="none" stroke="${COR.r500}" stroke-width="8" stroke-linecap="round" stroke-dasharray="${(2 * Math.PI * 22 * 0.92).toFixed(2)} ${(2 * Math.PI * 22).toFixed(2)}" transform="rotate(-90 30 30)"/>
    <text x="30" y="32" text-anchor="middle" font-family="Playfair" font-weight="900" font-size="15" fill="#fbf6ea">92%</text>
    <text x="30" y="40" text-anchor="middle" font-family="Source Sans" font-weight="600" font-size="4.6" letter-spacing=".6" fill="#cfe6bd">DE ÁGUA</text></svg>`;
  P.push(pagina('Composição química', `
    ${titulo('Composição química da <em>melancia</em>')}
    ${sec(`<p>A melancia é formada principalmente por água, que representa aproximadamente 92% de sua composição. Também possui açúcares naturais, vitaminas, minerais, fibras e compostos antioxidantes.</p>
      <p style="margin-bottom:0">Entre suas principais substâncias estão:</p>`, 'margin-bottom:4mm')}
    ${sec(`<div class="agua">${rosca}<div class="tx"><h3>Água (${Q('H₂O')})</h3>Representa a maior parte da fruta e ajuda na hidratação.
      ${barra([['H', 2], ['O', 1]]).replace('class="atomos"', 'class="atomos" style="margin-top:3mm;max-width:50mm"')}</div></div>`, 'margin-bottom:4.4mm')}
    ${sec(`<div class="subs">${subs.map(([nome, form, desc, bar]) => `<div class="subst"><h3><span>${nome}</span>${form ? Q(form) : ''}</h3><p>${cap(desc)}</p>${bar}</div>`).join('')}</div>
      <div class="leg-at"><span>Proporção de átomos na fórmula:</span><span><i style="background:${cA.C}"></i>C</span><span><i style="background:${cA.H};border:.2mm solid #b9c4a3"></i>H</span><span><i style="background:${cA.O}"></i>O</span><span><i style="background:${cA.N}"></i>N</span><span><i style="background:${cA.K}"></i>K</span></div>`, 'margin-bottom:4mm')}
    <p style="font-family:'Playfair';font-style:italic;font-weight:600;font-size:13.5pt;color:var(--v800);margin:0;border-left:1.4mm solid var(--r600);padding-left:4mm">A composição química faz da melancia um alimento nutritivo, mesmo apresentando poucas calorias.</p>`));

  /* ---- 6. Benefícios ---- */
  const ben = [
    ['drop', 'Hidratação', 'por possuir muita água, ajuda a repor líquidos e contribui para o funcionamento adequado do organismo.'],
    ['heart', 'Saúde do coração', 'contém licopeno e citrulina, substâncias estudadas por sua participação em processos relacionados à saúde cardiovascular.'],
    ['gut', 'Funcionamento do intestino', 'possui água e pequenas quantidades de fibras, que contribuem para a digestão.'],
    ['shield', 'Sistema imunológico', 'a vitamina C participa das defesas naturais do organismo.'],
    ['spark', 'Saúde da pele', 'a vitamina C contribui para a produção de colágeno, importante para a manutenção da pele.'],
    ['atom', 'Ação antioxidante', 'o licopeno ajuda a proteger as células contra os danos causados pelos radicais livres.'],
  ];
  P.push(pagina('Benefícios', `
    ${titulo('Benefícios da <em>melancia</em> para a saúde')}
    ${sec(`<p class="lead">A melancia oferece diversos benefícios quando faz parte de uma alimentação equilibrada.</p>`, 'margin-bottom:6mm')}
    <div class="ben">${ben.map(([i, t, d]) => `<div class="bcard"><div class="ib">${icone(i, 26)}</div><h3>${t}</h3><p>${cap(d)}</p></div>`).join('')}</div>`));

  /* ---- 7. Câncer ---- */
  P.push(pagina('Melancia e ciência', `
    ${titulo('A <em>melancia</em> pode prevenir ou curar o câncer?')}
    ${sec(`<div class="licop"><div style="color:var(--r600)">${icone('atom', 34)}</div><div><h3>O papel do licopeno</h3>
      <p style="margin-bottom:1.6mm">A melancia possui licopeno, um antioxidante que vem sendo estudado por pesquisadores devido à sua possível relação com a proteção das células.</p></div></div>`, 'margin-bottom:6mm')}
    ${sec(`<div class="duo">
      <div class="pn ok"><small>Possíveis efeitos protetores estudados</small><h2>O que os estudos investigam</h2>
        <p>Alguns estudos investigam a relação entre o consumo de alimentos ricos em licopeno e a redução de determinados riscos de doenças.</p></div>
      <div class="pn no"><small>Comprovação de prevenção ou cura</small><h2>O que não está comprovado</h2>
        <p>Entretanto, não existem provas de que comer melancia seja capaz de curar o câncer.</p></div>
    </div>`, 'margin-bottom:6mm')}
    ${sec(`<div class="alerta"><div class="x">${icone('warn', 34)}</div><div><b>A melancia não cura o câncer e não substitui tratamentos médicos.</b>
      <p>A fruta pode fazer parte de uma alimentação saudável, mas não substitui tratamentos médicos nem medicamentos.</p></div></div>`, 'margin-bottom:6mm')}
    <div style="flex:1;display:flex;align-items:flex-end;justify-content:center;margin-bottom:0">${svg('0 0 200 104', '120mm', fatia({ cx: 100, cy: 8, R: 92 }))}</div>`));

  /* ---- 8. Produção ---- */
  const mapa = mapaBrasil(path.join(RAIZ, 'mapa', 'brazil.svg'), ['ba', 'go', 'sp', 'rs', 'to', 'pa', 'rn']);
  P.push(pagina('Produção no Brasil', `
    ${titulo('Produção de <em>melancia</em> no Brasil')}
    ${sec(`<p>O Brasil é um importante produtor de melancia. A fruta é cultivada em praticamente todas as regiões do país, principalmente em locais com temperaturas mais elevadas e condições adequadas de irrigação.</p>`, 'margin-bottom:5mm')}
    ${sec(`<div style="display:grid;grid-template-columns:1.12fr 1fr;gap:5mm;align-items:stretch">
      <div class="mapa">${mapa}</div>
      <div style="display:flex;flex-direction:column;gap:4mm;justify-content:space-between">
        <div class="stats"><div class="stat"><b>2,25 milhões</b><span>de toneladas produzidas em 2025 (aproximadamente), segundo o IBGE</span></div>
          <div class="stat verm"><b>91 mil</b><span>hectares de área colhida (mais de 91 mil hectares)</span></div></div>
        <div><h3 style="margin-bottom:2mm">Estados produtores citados</h3>
          <div class="chips"><span>Bahia</span><span>Goiás</span><span>São Paulo</span><span>Rio Grande do Sul</span><span>Tocantins</span><span>Pará</span><span>Rio Grande do Norte</span></div>
          <div class="lg"><span><i style="background:${COR.r600}"></i>Estados citados</span><span><i style="background:${COR.v200}"></i>Demais estados</span></div></div>
      </div></div>`, 'margin-bottom:5mm')}
    ${sec(`<p>Entre os estados produtores estão Bahia, Goiás, São Paulo, Rio Grande do Sul, Tocantins, Pará e Rio Grande do Norte.</p>
      <p>Segundo dados do IBGE, em 2025 o Brasil produziu aproximadamente 2,25 milhões de toneladas de melancia, em uma área colhida de mais de 91 mil hectares.</p>`, 'margin-bottom:4mm')}
    <div class="licop" style="border-left-color:var(--v500)"><div style="color:var(--v700)">${icone('users', 34)}</div><div><h3>Importância econômica e geração de empregos</h3>
      <p>A produção movimenta a economia, gera empregos no campo, fortalece o comércio e abastece supermercados, feiras e mercados de diferentes regiões.</p></div></div>`));

  /* ---- 9. Usos ---- */
  const usos = [
    ['glass', 'Sucos', 'utilizados como bebidas refrescantes.'],
    ['pop', 'Sorvetes e picolés', 'preparados com a polpa da fruta.'],
    ['jar', 'Geleias', 'produzidas com a polpa ou com a parte branca da casca.'],
    ['candy', 'Doces', 'a casca pode ser utilizada no preparo de doces.'],
    ['bowl', 'Saladas de frutas', 'a polpa é bastante utilizada em preparações.'],
    ['bottle', 'Cosméticos', 'alguns produtos utilizam extratos de melancia em suas formulações.'],
    ['factory', 'Indústria alimentícia', 'utiliza a fruta na produção de bebidas e outros alimentos.'],
  ];
  P.push(pagina('Indústria e alimentação', `
    ${titulo('Utilização da <em>melancia</em> na indústria e na alimentação')}
    ${sec(`<p class="lead">A melancia não é utilizada apenas para consumo <i>in natura</i>. Ela também pode ser transformada em diversos produtos.</p>`, 'margin-bottom:6mm')}
    <div class="usos">${usos.map(([i, t, d], k) => `<div class="uso${k === 6 ? ' larg' : ''}"><div class="iu">${icone(i, 28)}</div><div><h3>${t}</h3><p>${cap(d)}</p></div></div>`).join('')}</div>
    <div style="flex:1;display:flex;align-items:flex-end;justify-content:center;margin-bottom:0">${svg('0 0 200 104', '110mm', fatia({ cx: 100, cy: 8, R: 92 }))}</div>`));

  /* ---- 10. Casca e sementes ---- */
  const R = 62, cx = 100, cy = 8;
  const pt = (k, a) => [cx + R * k * Math.cos((a * Math.PI) / 180), cy + R * k * Math.sin((a * Math.PI) / 180)];
  const call = (k, a, x, y, linhas, cor, ancora) => {
    const [px, py] = pt(k, a);
    return `<path d="M${px.toFixed(1)},${py.toFixed(1)} L${x},${y} " stroke="${cor}" stroke-width=".7" fill="none"/><circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="1.5" fill="#fff" stroke="${cor}" stroke-width=".8"/>
      <text x="${ancora === 'end' ? x - 2 : x + 2}" y="${y - 2.4}" text-anchor="${ancora}" font-family="Source Sans" font-weight="700" font-size="5.4" fill="${cor}">${linhas.map((l, i) => `<tspan x="${ancora === 'end' ? x - 2 : x + 2}" dy="${i ? 6 : 0}">${l}</tspan>`).join('')}</text>`;
  };
  const diagrama = `<svg viewBox="0 0 200 82" width="100%">${fatia({ cx, cy, R })}
    ${call(0.99, 148, 30, 22, ['Parte verde', 'externa'], '#1b5a31', 'end')}
    ${call(0.945, 126, 40, 58, ['Parte branca', 'da casca'], '#6b7a3d', 'end')}
    ${call(0.34, 62, 168, 24, ['Sementes'], '#1d1815', 'start')}
    ${call(0.62, 38, 168, 52, ['Polpa'], COR.r700, 'start')}</svg>`;
  P.push(pagina('Casca e sementes', `
    ${titulo('Aproveitamento da casca e das <em>sementes</em>')}
    ${sec(`<p class="lead">Uma curiosidade interessante é que nem todas as partes da melancia precisam ser descartadas.</p>`, 'margin-bottom:5mm')}
    ${sec(`<div class="diag">${diagrama}</div>`, 'margin-bottom:5mm')}
    ${sec(`<div class="partes" style="grid-template-columns:1fr 1fr 1fr">
      <div class="parte" style="border-left-color:#8fa25a"><h3>Parte branca</h3><p>A parte branca da casca pode ser utilizada em receitas de doces, compotas e conservas.</p></div>
      <div class="parte" style="border-left-color:#1b5a31"><h3>Parte verde</h3><p>Já a parte verde externa pode ser aproveitada em preparações específicas ou encaminhada para compostagem.</p></div>
      <div class="parte" style="border-left-color:#1d1815"><h3>Sementes</h3><p>As sementes também possuem nutrientes, como proteínas, gorduras e minerais. Quando preparadas adequadamente, podem ser consumidas torradas ou utilizadas em algumas receitas.</p></div>
    </div>`, 'margin-bottom:5mm')}
    <div class="alerta" style="background:var(--v900)"><div class="x">${icone('leaf', 34)}</div><div><p style="font-size:13pt">O aproveitamento dessas partes ajuda a diminuir o desperdício de alimentos e contribui para um consumo mais consciente.</p></div></div>`));

  /* ---- 11. Impactos ---- */
  P.push(pagina('Impactos ambientais', `
    ${titulo('Impactos ambientais da <em>produção</em>')}
    ${sec(`<p class="lead">O cultivo da melancia apresenta benefícios econômicos, mas também pode causar impactos ambientais quando não é realizado de maneira adequada.</p>`, 'margin-bottom:6mm')}
    <div class="split">
      <div class="im"><h2>Desafios</h2>
        <div class="itm"><span class="it">${icone('drop', 22)}</span>Consumo de água na irrigação</div>
        <div class="itm"><span class="it">${icone('flask', 22)}</span>Uso inadequado de fertilizantes e defensivos agrícolas</div>
        <div class="itm"><span class="it">${icone('trash', 22)}</span>Produção de resíduos</div>
        <p style="margin-top:6mm">Entre os principais desafios estão o consumo de água na irrigação, o uso inadequado de fertilizantes e defensivos agrícolas e a produção de resíduos.</p></div>
      <div class="pr"><h2>Práticas sustentáveis</h2>
        <div class="itm"><span class="it">${icone('wave', 22)}</span>Sistemas de irrigação mais eficientes</div>
        <div class="itm"><span class="it">${icone('soil', 22)}</span>Manejo correto do solo</div>
        <div class="itm"><span class="it">${icone('basket', 22)}</span>Evitar desperdícios</div>
        <div class="itm"><span class="it">${icone('leaf', 22)}</span>Compostagem dos restos da produção</div>
        <p style="margin-top:6mm">Para diminuir esses impactos, os produtores podem utilizar sistemas de irrigação mais eficientes, realizar o manejo correto do solo, evitar desperdícios e aproveitar os restos da produção para compostagem.</p></div>
    </div
    <div style="flex:1;display:flex;align-items:flex-end;justify-content:center;padding-top:8mm">${svg('0 0 200 104', '110mm', `${folha({ x: 6, y: 96, len: 46, ang: -20, cor: '#3f9a4f' })}${folha({ x: 194, y: 96, len: 46, ang: 200, cor: '#3f9a4f' })}${fatia({ cx: 100, cy: 8, R: 92 })}`)}</div>`));

  /* ---- 12. Curiosidades ---- */
  const cur = [
    ['2', 'Sua origem está relacionada ao continente africano.', ''],
    ['3', 'Existem variedades com polpa vermelha, amarela e alaranjada.', 'v'],
    ['4', 'A parte branca da casca também pode ser aproveitada na alimentação.', ''],
    ['5', 'As sementes possuem nutrientes e podem ser utilizadas em receitas.', 'r'],
    ['6', 'O licopeno é um dos responsáveis pela coloração vermelha da polpa.', 'r'],
    ['7', 'Apesar de ser chamada de fruta, a melancia também é classificada como hortaliça em contextos agrícolas.', 'v'],
  ];
  P.push(pagina('Curiosidades', `
    ${titulo('Curiosidades sobre a <em>melancia</em>')}
    <div class="cur">
      <div class="cc g"><span class="n">92%</span><p>A melancia é composta por aproximadamente 92% de água.</p></div>
      ${cur.map(([k, t, c], i) => `<div class="cc ${c}"><span class="n">${String(i + 1).padStart(2, '0')}</span><p>${t}</p></div>`).join('')}
    </div>
    <div style="flex:1;display:flex;align-items:flex-end;justify-content:center;margin-bottom:0">${svg('0 0 200 80', '140mm', `${folha({ x: 10, y: 74, len: 44, ang: -18, cor: '#3f9a4f' })}${folha({ x: 190, y: 74, len: 44, ang: 198, cor: '#3f9a4f' })}${inteira({ cx: 100, cy: 56, r: 24 })}${inteira({ cx: 55, cy: 66, r: 14 })}${fatia({ cx: 148, cy: 62, R: 20 })}`)}</div>`));

  /* ---- 13. Conclusão ---- */
  P.push(pagina('Conclusão', `
    ${titulo('<em>Conclusão</em>')}
    ${sec(`<p class="lead">A melancia é muito mais do que uma fruta refrescante. Sua composição química apresenta substâncias importantes, como água, vitaminas, minerais, licopeno e citrulina, que contribuem para diferentes funções do organismo.</p>
      <p class="lead">Além dos benefícios alimentares, ela possui grande importância para a agricultura e para a economia brasileira. Sua utilização também vai além da polpa, pois a casca e as sementes podem ser aproveitadas de diversas maneiras.</p>
      <p class="lead">Portanto, a melancia é um alimento de grande valor nutricional, econômico e ambiental, mostrando como uma fruta tão comum no nosso dia a dia pode apresentar tantas características interessantes.</p>`, 'margin-bottom:7mm')}
    ${sec(`<div class="sint"><h2>Principais descobertas do trabalho</h2><ul>
      <li>Aproximadamente 92% da melancia é água.</li>
      <li>Licopeno e citrulina contribuem para diferentes funções do organismo.</li>
      <li>A melancia não cura o câncer e não substitui tratamentos médicos.</li>
      <li>Em 2025, o Brasil produziu aproximadamente 2,25 milhões de toneladas, segundo o IBGE.</li>
      <li>Casca e sementes podem ser aproveitadas, reduzindo o desperdício.</li>
      <li>O cultivo exige cuidados com água, solo e resíduos.</li></ul></div>`)}
    <div style="flex:1;display:flex;align-items:flex-end;justify-content:center;margin-bottom:0">${svg('0 0 200 104', '128mm', `${folha({ x: 4, y: 98, len: 50, ang: -22, cor: '#3f9a4f' })}${folha({ x: 196, y: 98, len: 50, ang: 202, cor: '#3f9a4f' })}${fatia({ cx: 100, cy: 8, R: 92 })}`)}</div>`));

  /* ---- 14. Fotos (somente no final) ---- */
  const gal = [['melancia-polpa', 'Melancia e sua polpa'], ['variedades', 'Variedades da fruta'], ['sementes', 'Sementes'], ['casca', 'Aproveitamento da casca']];
  P.push(pagina('Imagens', `
    ${titulo('Imagens que combinam com o <em>trabalho</em>')}
    <div class="galeria">${gal.map(([s, l]) => `<div class="gc">${foto(s, l)}<h3>${l}</h3></div>`).join('')}</div>`));

  /* ---- 15. Referências ---- */
  P.push(pagina('Referências', `
    ${titulo('Referências <em>bibliográficas</em>')}
    ${sec(`<h2>Fontes indicadas no trabalho</h2>
      <ol class="ref">
        <li><span><b>IBGE</b> — dados de produção de melancia no Brasil (2025: aproximadamente 2,25 milhões de toneladas; área colhida de mais de 91 mil hectares), conforme citado no texto do trabalho.</span></li>
        <li><span><b>IBGE</b> — Produção de melancia no Brasil.</span></li>
        <li><span><b>Embrapa</b> — Melancia.</span></li>
      </ol>
      <p class="nota" style="margin-top:2mm">Títulos conforme informados no material do grupo; endereço eletrônico, autoria e data de acesso não foram informados e não foram inventados.</p>`, 'margin-bottom:6mm')}
    ${sec(`<h2>Fontes adicionais consultadas</h2>
      <p class="nota" style="margin-bottom:3mm">Nenhuma fonte adicional foi consultada na diagramação deste documento: o conteúdo científico é o do texto original do grupo. Use as linhas abaixo para registrar outras fontes (autor, título, ano e link).</p>
      <div class="linha-fld"><i class="fld" data-name="fonte1"></i></div><div class="linha-fld"><i class="fld" data-name="fonte2"></i></div><div class="linha-fld"><i class="fld" data-name="fonte3"></i></div>`, 'margin-bottom:6mm')}
    ${sec(`<h2>Créditos de materiais</h2>
      <p class="cred"><b>Mapa do Brasil:</b> <i>@svg-maps/brazil</i>, de Victor Cazanave, licença CC BY 4.0 (creativecommons.org/licenses/by/4.0); estados citados destacados pelo grupo.<br>
      <b>Fotografias da seção final:</b> fornecidas pelo grupo; autoria não identificada.<br>
      <b>Tipografia:</b> Playfair Display e Source Sans 3 (SIL Open Font License, Google Fonts).<br>
      <b>Ilustrações:</b> vetoriais, criadas para este trabalho.</p>`)}`));

  return P;
}

/* ================================================================== RENDER */
const css = fs.readFileSync(path.join(RAIZ, 'src', 'estilo.css'), 'utf8').replaceAll("url('../fontes/", `url('${pathToFileURL(path.join(RAIZ, 'fontes'))}/`);
fs.mkdirSync(SAIDA_DIR, { recursive: true });
const paginas = montar();
const script = `<script>document.querySelectorAll('svg path.uf.hl').forEach(p=>{const b=p.getBBox();const t=document.createElementNS('http://www.w3.org/2000/svg','text');
t.textContent=p.dataset.uf.toUpperCase();t.setAttribute('x',b.x+b.width/2);t.setAttribute('y',b.y+b.height/2+6);t.setAttribute('text-anchor','middle');
t.setAttribute('font-family','Source Sans');t.setAttribute('font-weight','700');t.setAttribute('font-size','20');t.setAttribute('fill','#fff');t.setAttribute('stroke','#b81f3b');t.setAttribute('stroke-width','3');t.setAttribute('paint-order','stroke');
p.parentNode.appendChild(t);});</script>`;
fs.writeFileSync(SAIDA_HTML, `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>A Melancia: Composição Química, Benefícios e Importância no Brasil</title><style>${css}</style></head><body>${paginas.join('\n')}${script}</body></html>`);

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
    c.querySelectorAll(':scope > *').forEach((el) => { maxB = Math.max(maxB, el.getBoundingClientRect().bottom - (parseFloat(getComputedStyle(el).marginBottom) < 0 ? parseFloat(getComputedStyle(el).marginBottom) : 0)); });
    return { pagina: i + 1, ocupacao: Math.round(((maxB - cr.top) / cr.height) * 100), estouroPx: c.scrollHeight - c.clientHeight, blocos: [...c.querySelectorAll(':scope > *')].map((el) => mm(el.getBoundingClientRect().height)) };
  });
});
// posição dos campos editáveis (px CSS relativos à página)
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

// Campos de formulário (editáveis) na capa e nas linhas de fontes adicionais
const doc = await PDFDocument.load(bruto);
const form = doc.getForm();
const paginasPdf = doc.getPages();
for (const c of campos) {
  const pg = paginasPdf[c.pagina]; const H = pg.getHeight();
  const campo = form.createTextField(c.nome);
  campo.addToPage(pg, { x: c.x * 0.75, y: H - (c.y + c.h) * 0.75, width: c.w * 0.75, height: c.h * 0.75, borderWidth: 0, textColor: undefined });
  campo.setFontSize(11);
}
form.acroForm.dict.set(PDFName.of('NeedAppearances'), PDFBool.True);
doc.setTitle('A Melancia: Composição Química, Benefícios e Importância no Brasil');
fs.writeFileSync(SAIDA_PDF, await doc.save());
console.log(`PDF gerado: ${path.relative(RAIZ, SAIDA_PDF)} (${paginas.length} páginas; ${campos.length} campos editáveis)`);
if (faltando.length) console.log('Fotografias pendentes:', faltando.join(', '));
if (!ok) { console.error('Há páginas com estouro de conteúdo.'); process.exitCode = 1; }
