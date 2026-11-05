# Viagem e férias: quanto custa realizar um sonho? — Curitiba (Grupo 9)

Trabalho escolar sobre uma viagem de Patos de Minas (MG) a Curitiba (PR), diagramado em A4 vertical.

- **PDF final:** `viagem_curitiba_grupo9.pdf`
- **Original de referência:** `referencia/trabalho_viagem_curitiba_original.pdf`

## Como gerar o PDF
```bash
node src/construir.mjs               # gera viagem_curitiba_grupo9.pdf (usa Playwright/Chromium)
python3 src/verificar_textos.py      # compara o texto com o PDF original (nada pode sumir)
pdftoppm -r 80 -png viagem_curitiba_grupo9.pdf saida/p   # renderiza páginas para revisão visual
```
`construir.mjs` também mede cada página e falha se algum conteúdo passar da área útil.

## Estrutura
- `src/construir.mjs` — conteúdo, dados (valores originais, conferidos automaticamente), tabelas, gráficos e geração do PDF
- `src/estilo.css` — identidade visual (verdes + detalhes em azul), tipografia Montserrat/Open Sans
- `fontes/` — fontes embutidas no PDF (licença OFL)
- `fotos/` — fotografias reais e `fotos.json` (veja `fotos/LEIA-ME.md`)
