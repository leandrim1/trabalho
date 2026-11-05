# A melancia e a saúde dos rins

Trabalho escolar em formato de revista científica ilustrada, A4 vertical, 10 páginas.

- **PDF final:** `melancia_e_os_rins.pdf`
- **Texto original do grupo:** `referencia/texto_original.txt`

## Como gerar
```bash
npm install --ignore-scripts        # pdf-lib (linhas editáveis das referências)
node src/construir.mjs              # gera melancia_e_os_rins.pdf
python3 src/verificar_textos.py     # confere o texto contra o original
```
`construir.mjs` mede cada página e falha se algum conteúdo passar da área útil.

## Estrutura
| Página | Conteúdo |
|---|---|
| 1 | Capa |
| 2 | Introdução, fluxo água → hidratação → filtragem → eliminação e índice das 6 perguntas |
| 3 | 01 — Ajuda no funcionamento dos rins (esquema do percurso do sangue e da urina) |
| 4 | 02 — Prevenção de pedras nos rins (urina mais × menos concentrada) |
| 5 | 03 — Contém potássio · 04 — Ajuda na eliminação de resíduos |
| 6 | 05 — A melancia limpa os rins? (crença popular × o que acontece) |
| 7 | 06 — Quem tem problemas nos rins pode comer melancia? |
| 8 | Síntese |
| 9 | Imagens da fruta (fotografias só no final) |
| 10 | Referências e créditos |

## Observações
- As ilustrações, esquemas e ícones são vetoriais, criados para este trabalho.
- As fotografias da página 9 foram fornecidas pelo grupo, têm baixa resolução (309 px de largura)
  e estão sem crédito de autoria, porque a autoria não foi informada.
- O texto original não trazia fontes. Nenhuma foi inventada: a página 10 explica isso e traz
  linhas editáveis para o grupo registrar as fontes realmente consultadas.
