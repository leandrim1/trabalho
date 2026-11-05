# A Melancia — trabalho escolar (revista científica ilustrada)

PDF final: `a_melancia.pdf` (A4, 15 páginas). Capa com campos editáveis (aluno, escola, professor, turma, disciplina, cidade e ano).

```bash
npm install --ignore-scripts      # instala pdf-lib (campos editáveis)
node src/construir.mjs            # gera a_melancia.pdf
python3 src/verificar_textos.py   # confere o texto contra referencia/texto_original.txt
```
- Fotografias ficam **somente no final** (página 14): ver `fotos/fotos.json` (as 4 atuais são provisórias, de baixa resolução).
- Ilustrações, infográficos e mapa são vetoriais. Mapa: `@svg-maps/brazil` (CC BY 4.0).
