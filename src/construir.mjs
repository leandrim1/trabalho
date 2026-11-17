// Gera o PDF "Viagem e férias: quanto custa realizar um sonho?" (Grupo 9)
// Uso:  node src/construir.mjs
// Saída: viagem_curitiba_grupo9.pdf  (+ saida/documento.html para depuração)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Variáveis de ambiente opcionais (úteis para testes): FOTOS_DIR, SAIDA_DIR, PDF_SAIDA
const SAIDA_DIR = process.env.SAIDA_DIR ? path.resolve(process.env.SAIDA_DIR) : path.join(RAIZ, 'saida');
const SAIDA_HTML = path.join(SAIDA_DIR, 'documento.html');
const SAIDA_PDF = process.env.PDF_SAIDA ? path.resolve(process.env.PDF_SAIDA) : path.join(RAIZ, 'viagem_curitiba_grupo9.pdf');

/* ==========================================================================
   DADOS ORIGINAIS (copiados do PDF de referência — não alterar valores)
   ========================================================================== */
const ORC = [
  { id: 'eco', nome: 'Econômica', cor: 'var(--eco)' },
  { id: 'int', nome: 'Intermediária', cor: 'var(--int)' },
  { id: 'con', nome: 'Confortável', cor: 'var(--con)' },
];

const DESPESAS = [
  ['Transporte ida e volta', 700, 700, 700],
  ['Hospedagem (4 noites)', 400, 600, 750],
  ['Alimentação', 300, 400, 500],
  ['Transporte local', 75, 150, 300],
  ['Passeios', 325, 400, 550],
];
const TOTAL_PESSOA_TXT = ['R$ 1.800', 'R$ 2.250', 'R$ 2.800'];
const TOTAL_PESSOA = [1800, 2250, 2800];
const TOTAL_CASAL_TXT = ['R$ 3.600', 'R$ 4.500', 'R$ 5.600'];
const TOTAL_CASAL = [3600, 4500, 5600];
const PARCELAS = [
  // [à vista pessoa, 6x pessoa, 6x casal]
  ['R$ 1.800', '6x R$ 300,00', '6x R$ 600,00'],
  ['R$ 2.250', '6x R$ 375,00', '6x R$ 750,00'],
  ['R$ 2.800', '6x R$ 466,67', '6x R$ 933,33'],
];

const brl = (n) => 'R$ ' + n.toLocaleString('pt-BR');

// Conferência dos cálculos originais (apenas verifica; nunca altera os valores do PDF)
(function conferirCalculos() {
  for (let i = 0; i < 3; i++) {
    const soma = DESPESAS.reduce((s, l) => s + l[i + 1], 0);
    if (soma !== TOTAL_PESSOA[i]) throw new Error(`Soma da coluna ${ORC[i].nome} (${soma}) difere do total original`);
    if (TOTAL_PESSOA[i] * 2 !== TOTAL_CASAL[i]) throw new Error(`Casal ${ORC[i].nome} difere do dobro`);
    if (brl(TOTAL_PESSOA[i]) !== TOTAL_PESSOA_TXT[i] || brl(TOTAL_CASAL[i]) !== TOTAL_CASAL_TXT[i]) throw new Error('Formato de valor');
    const p1 = (TOTAL_PESSOA[i] / 6).toFixed(2).replace('.', ',');
    const p2 = (TOTAL_CASAL[i] / 6).toFixed(2).replace('.', ',');
    const fmt = (s) => s.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const [pi, pd] = p1.split(','); const [ci, cd] = p2.split(',');
    if (PARCELAS[i][1] !== `6x R$ ${fmt(pi)},${pd}` || PARCELAS[i][2] !== `6x R$ ${fmt(ci)},${cd}`)
      throw new Error(`Parcelas ${ORC[i].nome} não conferem: ${p1} / ${p2}`);
  }
})();

/* ==========================================================================
   FOTOGRAFIAS — lidas de fotos/fotos.json (se existir)
   ========================================================================== */
const FOTOS_DIR = process.env.FOTOS_DIR ? path.resolve(process.env.FOTOS_DIR) : path.join(RAIZ, 'fotos');
let MANIFESTO = {};
try { MANIFESTO = JSON.parse(fs.readFileSync(path.join(FOTOS_DIR, 'fotos.json'), 'utf8')); } catch { /* sem fotos ainda */ }

function infoFoto(slug) {
  const m = MANIFESTO[slug];
  if (!m || !m.arquivo) return null;
  if (!fs.existsSync(path.join(FOTOS_DIR, m.arquivo))) return null;
  return m;
}
const faltando = [];

function foto(slug, rotulo, { fallback } = {}) {
  const m = infoFoto(slug) || (fallback && infoFoto(fallback));
  if (m) {
    const pos = m.posicao ? `style="object-position:${m.posicao}"` : '';
    return `<figure class="foto"><img src="${pathToFileURL(path.join(FOTOS_DIR, m.arquivo))}" alt="${rotulo}" ${pos}></figure>`;
  }
  faltando.push(slug);
  return `<figure class="foto ph"><div class="ph-in">${ic('camera', 34)}<b>Fotografia pendente</b><span>${rotulo}</span></div></figure>`;
}
function urlFotoRoteiro(slug, fallback) {
  const m = infoFoto(slug) || (fallback && infoFoto(fallback));
  return m ? { url: String(pathToFileURL(path.join(FOTOS_DIR, m.arquivo))), pos: m.posicao || '50% 50%' } : null;
}

/* ==========================================================================
   ÍCONES (SVG simples, traço)
   ========================================================================== */
const ICONES = {
  bus: '<rect x="4" y="3.5" width="16" height="13" rx="2.5"/><path d="M4 11h16M7 16.5V19.5M17 16.5V19.5"/><circle cx="8.2" cy="13.8" r=".7" fill="currentColor"/><circle cx="15.8" cy="13.8" r=".7" fill="currentColor"/>',
  bed: '<path d="M3 19V6"/><path d="M3 15h18v4"/><path d="M21 15v-3a3 3 0 0 0-3-3h-7v6"/><circle cx="7" cy="11.5" r="1.8"/>',
  food: '<path d="M7 3v7a2 2 0 0 0 4 0V3"/><path d="M9 3v18"/><path d="M17 21V3c-2.2 1.2-3.5 3.6-3.5 7 0 1.8 1.2 3 3.5 3"/>',
  pin: '<path d="M12 21s-7-6.1-7-11.2A7 7 0 0 1 19 9.8C19 14.9 12 21 12 21z"/><circle cx="12" cy="10" r="2.6"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M8 3v4M16 3v4M3.5 10h17"/>',
  card: '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19M6.5 15h4"/>',
  star: '<path d="M12 3.2l2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 17.1l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  users: '<circle cx="9" cy="8.5" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9.5" r="2.6"/><path d="M16 14.2c.3-.1.7-.2 1-.2 2.2 0 4 1.8 4 4"/>',
  camera: '<path d="M4 8h3l1.6-2.2h6.8L17 8h3a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 20 20H4a1.5 1.5 0 0 1-1.5-1.5v-9A1.5 1.5 0 0 1 4 8z"/><circle cx="12" cy="13.5" r="3.6"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.2M12 7.8v.2"/>',
  chart: '<path d="M4 20V4M4 20h16"/><rect x="7.5" y="11" width="3" height="6" rx=".6"/><rect x="12.5" y="7" width="3" height="10" rx=".6"/>',
  tag: '<path d="M3.5 12.2V4.5a1 1 0 0 1 1-1h7.7l8.3 8.3a1.5 1.5 0 0 1 0 2.1l-5.6 5.6a1.5 1.5 0 0 1-2.1 0z"/><circle cx="8" cy="8" r="1.4"/>',
  warn: '<path d="M12 3.5l9.5 16.5h-19z"/><path d="M12 10v4.6M12 17.2v.2"/>',
};
function ic(nome, tam = 22) {
  return `<svg class="ic" viewBox="0 0 24 24" width="${tam}" height="${tam}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONES[nome]}</svg>`;
}

/* ==========================================================================
   COMPONENTES
   ========================================================================== */
const TXT_RODAPE = 'Grupo 9 • Viagem e férias • Curitiba – PR';
let numPagina = 0;

function pagina(conteudo, { capa = false } = {}) {
  numPagina += 1;
  const rodape = `<div class="footer"><span class="marca">${TXT_RODAPE}</span><span class="pg">Página ${numPagina}</span></div>`;
  return `<section class="page${capa ? ' capa' : ''}">${conteudo}${rodape}</section>`;
}
const content = (html) => `<div class="content">${html}</div>`;
const sec = (html, estilo = '') => `<div class="sec"${estilo ? ` style="${estilo}"` : ''}>${html}</div>`;

function tabelaOrcamento() {
  const cab = ORC.map((o) => `<th class="n">${o.nome}</th>`).join('');
  const linhas = DESPESAS.map((l) => `<tr><td class="rot">${l[0]}</td>${l.slice(1).map((v) => `<td class="n">${brl(v)}</td>`).join('')}</tr>`).join('');
  const total = `<tr class="total"><td>TOTAL POR PESSOA</td>${TOTAL_PESSOA_TXT.map((t) => `<td class="n">${t}</td>`).join('')}</tr>`;
  return `<table class="t"><colgroup><col style="width:37%"><col style="width:21%"><col style="width:21%"><col style="width:21%"></colgroup>
    <thead><tr><th>Despesas</th>${cab}</tr></thead><tbody>${linhas}${total}</tbody></table>`;
}

function graficoHorizontal(titulo, valores, textos) {
  const max = Math.max(...valores);
  const escala = 0.74; // a maior barra ocupa 74% da trilha; o valor fica logo após a barra
  const linhas = ORC.map((o, i) => {
    const w = (valores[i] / max) * escala * 100;
    return `<div class="hrow"><div class="lab">${o.nome}</div>
      <div class="trk"><div class="bar" style="width:${w.toFixed(2)}%;background:${o.cor}"></div>
      <div class="val" style="left:calc(${w.toFixed(2)}% + 3mm)">${textos[i]}</div></div></div>`;
  }).join('');
  return `<div class="chart"><h3>${titulo}</h3>${linhas}</div>`;
}

function graficoCasal() {
  const max = Math.max(...TOTAL_CASAL);
  const alturaMax = 37; // mm disponíveis para a maior coluna
  const grupos = ORC.map((o, i) => {
    const h1 = (TOTAL_PESSOA[i] / max) * alturaMax;
    const h2 = (TOTAL_CASAL[i] / max) * alturaMax;
    return `<div class="vgrp">
      <div class="vcol"><span class="vv">${TOTAL_PESSOA_TXT[i]}</span><div class="vb" style="height:${h1.toFixed(2)}mm;background:${o.cor};opacity:.38"></div></div>
      <div class="vcol"><span class="vv">${TOTAL_CASAL_TXT[i]}</span><div class="vb" style="height:${h2.toFixed(2)}mm;background:${o.cor}"></div></div>
      <div class="vl">${o.nome}</div></div>`;
  }).join('');
  return `<div class="chart"><h3>Custo estimado para um casal</h3>
    <div class="legenda"><span><i style="background:#9DB9AB"></i>Uma pessoa</span><span><i style="background:var(--v900)"></i>Casal</span></div>
    <div class="vchart"><div class="grid"><i></i><i></i><i></i><i></i></div>${grupos}</div></div>`;
}

const perfis = [
  ['Econômica', 'hospedagem simples, refeições econômicas, transporte coletivo e preferência por atrações gratuitas.', 'var(--eco)'],
  ['Intermediária', 'hospedagem confortável, alimentação variada e alguns passeios pagos.', 'var(--int)'],
  ['Confortável', 'hospedagem superior, restaurantes e maior uso de transporte por aplicativo e atrações pagas.', 'var(--con)'],
];

const ATRACOES = [
  ['jardim-botanico', 'Jardim Botânico', 'Um dos cartões-postais mais famosos da cidade. Entrada gratuita.'],
  ['opera-de-arame', 'Ópera de Arame', 'Teatro construído com estrutura metálica, cercado por natureza.'],
  ['parque-tangua', 'Parque Tanguá', 'Conhecido por seus jardins, mirantes e paisagens.'],
  ['museu-oscar-niemeyer', 'Museu Oscar Niemeyer', 'Museu conhecido por sua arquitetura moderna.'],
  ['parque-barigui', 'Parque Barigui', 'Área verde ideal para caminhadas e lazer.'],
  ['bosque-alemao', 'Bosque Alemão', 'Espaço de natureza, cultura e histórias infantis.'],
];

const ROTEIRO = [
  ['1º', 'Jardim Botânico', 'Conhecer a estufa, os jardins e aproveitar para tirar fotografias.', 'jardim-botanico'],
  ['2º', 'Museu Oscar Niemeyer', 'Visitar as exposições e observar a arquitetura moderna do museu.', 'museu-oscar-niemeyer'],
  ['3º', 'Ópera de Arame', 'Conhecer o teatro e aproveitar a paisagem natural ao redor.', 'opera-de-arame'],
  ['4º', 'Parque Tanguá', 'Passear pelos jardins e apreciar o pôr do sol no mirante.', 'parque-tangua'],
  ['5º', 'Centro Histórico e Bosque Alemão', 'Conhecer construções históricas, feiras de artesanato e espaços culturais.', 'bosque-alemao'],
];

// Mostra a URL quebrando só depois das barras (nunca no meio de um trecho nem após hífen)
function urlQuebravel(url) {
  const [esq, resto] = url.split('://');
  return esq + '://' + resto.split('/').map((t) => `<span class="nw">${t}</span>`).join('/<wbr>');
}

const FONTES = [
  ['Busca Ônibus — Patos de Minas para Curitiba', 'https://passagens.buscaonibus.com.br/passagens-de-onibus/patos-de-minas-mg-para-curitiba-pr'],
  ['Guia de custos — Curitiba em novembro de 2026', 'https://www.queroviajarmais.com/indice-viajante-inteligente/curitiba/', 'Quero Viajar Mais — Índice do Viajante'],
  ['Linha Turismo — URBS (site oficial)', 'https://www.urbs.curitiba.pr.gov.br/portal/transporte/linha-turismo/'],
  ['Linha Turismo — Perguntas frequentes', 'https://linhaturismo.curitiba.pr.gov.br/duvidas-frequentes'],
  ['Museu Oscar Niemeyer — Visite', 'https://www.museuoscarniemeyer.org.br/visite'],
  ['Parque Jaime Lerner — Ópera de Arame', 'https://parquejaimelerner.com.br/'],
  ['Turismo Curitiba — Parque Tanguá', 'https://turismo.curitiba.pr.gov.br/conteudo/parque-tangua/1534'],
];

/* ==========================================================================
   PÁGINAS
   ========================================================================== */
// Créditos das fotografias (preenchidos a partir de fotos/fotos.json)
const NOMES_FOTO = { capa: 'Capa', ...Object.fromEntries(ATRACOES.map(([slug, nome]) => [slug, nome])) };
const creditos = Object.entries(MANIFESTO)
  .filter(([slug, m]) => m.credito && infoFoto(slug))
  .map(([slug, m]) => `<b>${NOMES_FOTO[slug] || slug}:</b> ${m.credito}`);

// Se `creditosAparte` for verdadeiro, os créditos vão para uma página própria no final
// (o script faz isso sozinho quando eles não cabem na página de Fontes).
function montarPaginas(creditosAparte) {
numPagina = 0; faltando.length = 0;
const paginas = [];

// 1 — Capa
paginas.push(pagina(`
  <div class="hero">${foto('capa', 'Jardim Botânico de Curitiba', { fallback: 'jardim-botanico' })}</div>
  <div class="pill">GRUPO 9</div>
  <div class="corpo">
    <div class="kick">Trabalho escolar</div>
    <h1>VIAGEM E FÉRIAS:<br><span>QUANTO CUSTA REALIZAR<br>UM SONHO?</span></h1>
    <p class="sub">Planejamento de uma viagem de Patos de Minas (MG) para Curitiba (PR).</p>
    <div class="info">
      <div><span class="ico">${ic('calendar', 22)}</span><span><small>Duração simulada</small><b>5 dias e 4 noites</b></span></div>
      <div><span class="ico">${ic('clock', 22)}</span><span><small>Data de referência</small><b>novembro de 2026</b></span></div>
      <div><span class="ico">${ic('chart', 22)}</span><span><small>Comparação de</small><b>três orçamentos</b></span></div>
      <div><span class="ico">${ic('tag', 22)}</span><span><small>Valores</small><b>estimados</b></span></div>
      <div class="largo"><span class="ico">${ic('users', 22)}</span><span><small>Alunos</small><b>Gabrielly Silva • Laryssa de Cássia • Gustavo Henrique • Lara Stefany</b></span></div>
    </div>
  </div>`, { capa: true }));

// 2 — Introdução
paginas.push(pagina(content(`
  ${sec(`<h2>Introdução</h2>
    <p class="lead">Viajar é o sonho de muitas pessoas, mas para realizá-lo é necessário planejamento financeiro. Neste trabalho, comparamos três possibilidades de viagem para Curitiba, capital do Paraná, saindo de Patos de Minas, Minas Gerais.</p>
    <p>O objetivo é estimar os gastos com transporte, hospedagem, alimentação e passeios, comparar pagamento à vista e parcelado e descobrir qual opção oferece o melhor custo-benefício.</p>`)}
  ${sec(`<h3>O que o trabalho analisa</h3>
    <div class="obj">
      <div><span class="ico">${ic('bus', 26)}</span>Transporte</div>
      <div><span class="ico">${ic('bed', 26)}</span>Hospedagem</div>
      <div><span class="ico">${ic('food', 26)}</span>Alimentação</div>
      <div><span class="ico">${ic('pin', 26)}</span>Passeios</div>
      <div><span class="ico">${ic('card', 26)}</span>Pagamento à vista e parcelado</div>
      <div><span class="ico">${ic('star', 26)}</span>Melhor <span class="nw">custo-benefício</span></div>
    </div>`)}
  ${sec(`<h3>A viagem em resumo</h3>
    <div class="rota">
      <div class="pt"><small>Origem</small><b>Patos de Minas<br>Minas Gerais</b></div>
      <div class="linha"><span class="bolha">${ic('bus', 22)}</span></div>
      <div class="pt"><small>Destino</small><b>Curitiba<br>Paraná</b></div>
    </div>
    <div class="fatos">
      <div><small>Duração simulada</small><b>5 dias e 4 noites</b></div>
      <div><small>Data de referência</small><b>novembro de 2026</b></div>
      <div><small>Orçamentos comparados</small><b>Econômica, Intermediária e Confortável</b></div>
    </div>`)}
`)));

// 3 — Conhecendo Curitiba
paginas.push(pagina(content(`
  ${sec(`<h2>Conhecendo Curitiba</h2>
    <p>Curitiba é conhecida por seus parques, áreas verdes, arquitetura, museus e espaços culturais. Entre os pontos turísticos mais conhecidos estão o Jardim Botânico, a Ópera de Arame, o Parque Tanguá, o Museu Oscar Niemeyer, o Parque Barigui e o Bosque Alemão.</p>`, 'margin-bottom:6mm')}
  <div class="galeria">${ATRACOES.map(([slug, nome, desc]) =>
    `<div class="gcard">${foto(slug, nome)}<h3>${nome}</h3><p>${desc}</p></div>`).join('')}</div>
`)));

// 4 — Transporte + Comparação dos três orçamentos
paginas.push(pagina(content(`
  ${sec(`<h2>Transporte: Patos de Minas para Curitiba</h2>
    <p>Na consulta feita à Busca Ônibus, apareceram passagens de Patos de Minas para Curitiba a partir de aproximadamente R$ 348,07 por trecho, mais taxas, em uma viagem com conexão. Para o orçamento, arredondamos a ida e a volta para R$ 700 por pessoa. O valor final depende da data, empresa, disponibilidade e taxas.</p>
    <div class="call azul" style="margin-top:3.4mm;margin-bottom:0"><span class="ico">${ic('bus', 24)}</span><span class="tx">Estimativa usada: <span class="big">R$ 700 por pessoa (ida e volta).</span></span></div>`, 'margin-bottom:6mm')}
  ${sec(`<h2>Comparação dos três orçamentos</h2>
    <p>Os valores abaixo são estimativas para cinco dias e quatro noites. A hospedagem é considerada por pessoa, dividindo o custo de um quarto compartilhado quando aplicável.</p>
    ${tabelaOrcamento()}
    <div style="margin-top:4mm">${perfis.map(([n, t, c]) =>
      `<div class="perfil"><span class="tag" style="background:${c}"></span><p><b>${n}:</b> ${t}</p></div>`).join('')}</div>`)}
`)));

// 5 — Gráfico por pessoa + Custo total para um casal
paginas.push(pagina(content(`
  ${sec(graficoHorizontal('Custo total estimado por pessoa', TOTAL_PESSOA, TOTAL_PESSOA_TXT), 'margin-bottom:7mm')}
  ${sec(`<h2>Custo total para um casal</h2>
    <p>Para estimar o custo de duas pessoas, multiplicamos o orçamento individual por dois. Na prática, alguns custos compartilhados, como o quarto, podem variar; por isso, este quadro usa uma estimativa simples para facilitar a comparação.</p>
    <table class="t" style="margin-bottom:5mm"><colgroup><col style="width:40%"><col style="width:30%"><col style="width:30%"></colgroup>
      <thead><tr><th>Opção</th><th class="n">Uma pessoa</th><th class="n">Casal</th></tr></thead>
      <tbody>${ORC.map((o, i) => `<tr><td class="rot"><span class="dot" style="display:inline-block;width:2.8mm;height:2.8mm;border-radius:50%;background:${o.cor};margin-right:2.4mm"></span>${o.nome}</td><td class="n">${TOTAL_PESSOA_TXT[i]}</td><td class="n"><b>${TOTAL_CASAL_TXT[i]}</b></td></tr>`).join('')}</tbody></table>
    ${graficoCasal()}`)}
`)));

// 6 — Pagamento + Passeios
paginas.push(pagina(content(`
  ${sec(`<h2>Pagamento à vista ou parcelado</h2>
    <p>Para comparar as formas de pagamento, simulamos o parcelamento em seis vezes sem juros. É apenas uma simulação matemática: cada empresa ou hospedagem pode oferecer condições diferentes, e algumas compras podem ter juros.</p>
    <table class="t compacta" style="margin-bottom:3.6mm"><colgroup><col style="width:27%"><col style="width:21%"><col style="width:26%"><col style="width:26%"></colgroup>
      <thead><tr><th>Opção</th><th class="n">À vista por pessoa</th><th class="n">6 parcelas por pessoa</th><th class="n">6 parcelas para casal</th></tr></thead>
      <tbody>${ORC.map((o, i) => `<tr><td class="rot"><span class="dot" style="display:inline-block;width:2.8mm;height:2.8mm;border-radius:50%;background:${o.cor};margin-right:2.2mm"></span>${o.nome}</td><td class="n">${PARCELAS[i][0]}</td><td class="n">${PARCELAS[i][1]}</td><td class="n">${PARCELAS[i][2]}</td></tr>`).join('')}</tbody></table>
    <div class="call verde" style="margin-bottom:0"><span class="tx">O pagamento à vista pode ser vantajoso quando há desconto. O parcelamento ajuda a dividir o valor, mas é importante conferir se existem juros e se as parcelas cabem no orçamento.</span></div>`)}
  ${sec(`<h2>Passeios e atrações de Curitiba</h2>
    <p>A cidade possui vários parques e espaços públicos que podem ser visitados gratuitamente. Alguns museus e atrações cobram ingresso.</p>
    <table class="t compacta"><colgroup><col style="width:30%"><col style="width:30%"><col style="width:40%"></colgroup>
      <thead><tr><th>Atração</th><th>Referência de preço</th><th>O que encontrar</th></tr></thead>
      <tbody>
        <tr><td class="rot">Jardim Botânico</td><td><span class="badge-g">Gratuito</span></td><td>Estufa, jardins e caminhos para passeio.</td></tr>
        <tr><td class="rot">Parque Tanguá</td><td><span class="badge-g">Gratuito</span></td><td>Mirante, jardins, lago e paisagem.</td></tr>
        <tr><td class="rot">Parque Barigui</td><td><span class="badge-g">Gratuito</span></td><td>Lago, áreas verdes e capivaras.</td></tr>
        <tr><td class="rot">Museu Oscar Niemeyer</td><td><span class="badge-g">Gratuito</span></td><td>Exposições de arte e arquitetura.</td></tr>
        <tr><td class="rot">Ópera de Arame</td><td><span class="nw">R$ 30 inteira /</span> <span class="nw">R$ 15 meia</span></td><td>Teatro de estrutura metálica e área natural.</td></tr>
      </tbody></table>`)}
`)));

// 7 — Linha Turismo + Roteiro
paginas.push(pagina(content(`
  ${sec(`<h2>Linha Turismo de Curitiba</h2>
    <p>A Linha Turismo é um ônibus especial que percorre 26 pontos turísticos da cidade. O cartão custa R$ 50 por pessoa e permite embarques ilimitados durante 24 horas a partir do primeiro uso. O percurso completo dura aproximadamente três horas, sem contar as paradas. O embarque inicial é na Rua 24 Horas, mas é possível começar em outros pontos do trajeto.</p>
    <p>Exemplos de atrações atendidas: Jardim Botânico, Museu Oscar Niemeyer, Bosque Alemão, Ópera de Arame, Parque Tanguá e Parque Barigui. O valor de R$ 50 é individual; para um casal, são R$ 100.</p>
    <p>Site oficial: <a href="https://www.urbs.curitiba.pr.gov.br/portal/transporte/linha-turismo/">URBS – Linha Turismo</a> | <a href="https://linhaturismo.curitiba.pr.gov.br/duvidas-frequentes">Perguntas frequentes</a></p>
    <div class="call azul" style="margin:4mm 0 0"><span class="ico">${ic('info', 24)}</span><span class="tx leg" style="color:var(--txt)"><b>Atenção:</b> o custo da Linha Turismo deve ser acrescentado ao orçamento de transporte local se não estiver incluído na estimativa escolhida. Os valores do quadro de orçamento são aproximados.</span></div>`, 'margin-bottom:8mm')}
  ${sec(`<h2>Sugestão de roteiro de cinco dias</h2>
    ${ROTEIRO.map(([n, titulo, desc, slug]) => {
      const u = urlFotoRoteiro(slug);
      return `<div class="dia"><div class="tile">${u ? `<img src="${u.url}" alt="${titulo}" style="object-position:${u.pos}">` : ''}<div class="nr">${n}<small>DIA</small></div></div>
        <div class="tx"><h3>${n} dia — ${titulo}</h3><p>${desc}</p></div></div>`;
    }).join('')}`)}
`)));

// 8 — Custo-benefício + Conclusão
paginas.push(pagina(content(`
  ${sec(`<h2><span>Qual opção oferece o melhor <span class="nb">custo-benefício?</span></span></h2>
    <p class="lead">A opção intermediária oferece um bom equilíbrio entre preço e conforto. Ela permite ficar em uma hospedagem mais confortável, ter alimentação variada e conhecer algumas atrações pagas sem gastar tanto quanto na opção confortável. A opção econômica também é interessante para quem deseja conhecer Curitiba gastando menos, aproveitando principalmente os parques e passeios gratuitos.</p>
    <div class="tres">${[
      ['suave', 'check', 'Menor gasto', 0, ''],
      ['rec', 'star', 'Melhor equilíbrio', 1, ' rec'],
      ['suave', 'users', 'Maior conforto', 2, ''],
    ].map(([cls, icone, rotulo, i, extra]) => `<div class="opc${extra}"><span class="sel ${cls === 'suave' ? 'suave' : ''}">${ic(icone, 15)} ${rotulo}</span><h3>${ORC[i].nome}</h3>
      <div class="m"><small>Por pessoa</small><b class="g">${TOTAL_PESSOA_TXT[i]}</b></div>
      <div class="m"><small>Casal</small><b>${TOTAL_CASAL_TXT[i]}</b></div>
      <div class="m"><small>6 parcelas por pessoa</small><b>${PARCELAS[i][1]}</b></div></div>`).join('')}
    </div>`, 'margin-bottom:9mm')}
  ${sec(`<h2>Conclusão</h2>
    <p class="lead">Com este trabalho, percebemos que realizar uma viagem exige planejamento, pesquisa e organização financeira. Curitiba oferece opções de lazer, cultura e contato com a natureza para diferentes orçamentos. Concluímos que não é necessário gastar muito para conhecer lugares incríveis: com escolhas inteligentes e planejamento, é possível realizar o sonho de viajar sem comprometer tanto o orçamento.</p>`)}
`)));

// 9 — Fontes de pesquisa
const fim = '<div class="fim">FIM</div>';
const creditosNaPagina = creditos.length && !creditosAparte
  ? sec(`<h3>Créditos das fotografias</h3><p class="leg" style="font-size:11pt;line-height:1.4">${creditos.join(' &nbsp;•&nbsp; ')}</p>`, 'margin-bottom:6mm') : '';
paginas.push(pagina(content(`
  ${sec(`<h2>Fontes de pesquisa</h2>
    <p>As páginas abaixo foram consultadas para verificar passagens, custos de viagem e informações oficiais sobre atrações e transporte turístico. Os preços podem mudar; é importante refazer as cotações na data em que a viagem for planejada.</p>
    <ol class="src">${FONTES.map(([nome, url, texto]) =>
      `<li><span><span class="nm">${nome}</span><a class="url" href="${url}">${texto ? texto + '<br>' : ''}${urlQuebravel(url)}</a></span></li>`).join('')}</ol>`, 'margin-bottom:6mm')}
  ${creditosNaPagina}
  <div class="obs" style="margin-bottom:8mm"><b>Observação sobre os valores:</b> a passagem consultada apareceu a partir de R$ 348,07 por trecho, mais taxas. Para o cálculo do trabalho, foi arredondada para R$ 700 ida e volta por pessoa. Hospedagem, alimentação, transporte local e passeios são estimativas de planejamento, não reservas confirmadas. A simulação de parcelamento considera seis vezes sem juros.</div>
  ${creditosAparte ? '' : fim}
`)));

// 10 (só quando necessário) — Créditos das fotografias
if (creditos.length && creditosAparte) {
  paginas.push(pagina(content(`
    ${sec(`<h2>Créditos das fotografias</h2>
      <p>As fotografias deste trabalho são de terceiros e foram utilizadas com identificação de autoria e licença.</p>
      <ol class="src">${creditos.map((c) => `<li><span>${c}</span></li>`).join('')}</ol>`, 'margin-bottom:8mm')}
    ${fim}
  `)));
}
return paginas;
}

/* ==========================================================================
   HTML + PDF
   ========================================================================== */
const css = fs.readFileSync(path.join(RAIZ, 'src', 'estilo.css'), 'utf8').replaceAll("url('../fontes/", `url('${pathToFileURL(path.join(RAIZ, 'fontes'))}/`);
fs.mkdirSync(path.dirname(SAIDA_HTML), { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage();

// Monta o HTML, carrega no Chromium e mede cada página (nada pode passar da área útil)
async function renderizarEMedir(paginas) {
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<title>Viagem e férias: quanto custa realizar um sonho? — Curitiba (Grupo 9)</title>
<style>${css}</style></head><body>${paginas.join('\n')}</body></html>`;
  fs.writeFileSync(SAIDA_HTML, html);
  await page.goto('file://' + SAIDA_HTML, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  return page.evaluate(() => {
    const mm = (px) => Math.round((px * 25.4) / 96);
    const out = [];
    document.querySelectorAll('.page').forEach((pg, i) => {
      const c = pg.querySelector('.content') || pg.querySelector('.corpo');
      if (!c) { out.push({ pagina: i + 1, capa: true }); return; }
      const cr = c.getBoundingClientRect();
      let maxB = cr.top;
      c.querySelectorAll(':scope > *').forEach((el) => { maxB = Math.max(maxB, el.getBoundingClientRect().bottom); });
      const blocos = [...c.querySelectorAll(':scope > *')].map((el) => mm(el.getBoundingClientRect().height));
      out.push({ pagina: i + 1, ocupacao: Math.round(((maxB - cr.top) / cr.height) * 100), estouroPx: c.scrollHeight - c.clientHeight, alturaMm: mm(cr.height), blocos });
    });
    return out;
  });
}

let paginas = montarPaginas(false);
let relatorio = await renderizarEMedir(paginas);
const ultimaEstoura = relatorio.at(-1).estouroPx > 1;
if (creditos.length && ultimaEstoura) {
  console.log('Créditos não cabem na página de Fontes — movendo para uma página própria.');
  paginas = montarPaginas(true);
  relatorio = await renderizarEMedir(paginas);
}

console.log('Relatório de layout (ocupação da área útil):');
let ok = true;
for (const r of relatorio) {
  if (r.capa) { console.log(`  p${r.pagina}: capa`); continue; }
  const flag = r.estouroPx > 1 ? '  <<< ESTOURO' : '';
  if (flag) ok = false;
  console.log(`  p${r.pagina}: ${r.ocupacao}%${flag}   (útil ${r.alturaMm} mm; blocos mm: ${r.blocos.join(' + ')})`);
}

await page.pdf({ path: SAIDA_PDF, width: '210mm', height: '297mm', printBackground: true, preferCSSPageSize: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
await browser.close();

console.log(`PDF gerado: ${path.relative(RAIZ, SAIDA_PDF)}  (${paginas.length} páginas)`);
const pend = [...new Set(faltando)];
if (pend.length) console.log(`Fotografias pendentes (${pend.length}): ${pend.join(', ')}`);
if (!ok) { console.error('Há páginas com estouro de conteúdo — ajuste o layout.'); process.exitCode = 1; }
