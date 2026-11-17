# Fotografias do trabalho

O PDF lê as fotos desta pasta através de `fotos/fotos.json` (copie `fotos.exemplo.json`
para `fotos.json` e ajuste). Cada foto que **não** estiver listada aparece no PDF como um
quadro rotulado **"Fotografia pendente"** — nada é inventado nem substituído por imagem genérica.

| Chave                  | Onde aparece                                             |
|------------------------|----------------------------------------------------------|
| `capa`                 | Capa (foto grande do Jardim Botânico, diferente da galeria; se faltar, usa `jardim-botanico`) |
| `jardim-botanico`      | Galeria + miniatura do 1º dia                            |
| `museu-oscar-niemeyer` | Galeria + miniatura do 2º dia                            |
| `opera-de-arame`       | Galeria + miniatura do 3º dia                            |
| `parque-tangua`        | Galeria + miniatura do 4º dia                            |
| `mercado-municipal`    | Galeria                                                  |
| `bosque-alemao`        | Galeria + miniatura do 5º dia                            |

Requisitos: fotografia real do local correto, horizontal, boa resolução (≥ 1600 px de largura),
sem repetir imagem entre atrações. O campo `credito` (autor e licença) é impresso numa seção
"Créditos das fotografias" — se não couber na página de Fontes, o script cria uma página própria.
`posicao` (opcional) ajusta o enquadramento, ex.: `"50% 30%"`.

Depois de colocar as fotos: `node src/construir.mjs` regenera o PDF.

## Estado atual
As seis fotografias foram fornecidas pelo grupo e já estão em uso (`fotos.json`).
- **Jardim Botânico**: 640 × 480 px. Boa na galeria, mas fica macia se a capa for impressa em A4
  (≈ 77 dpi). Para impressão, troque por uma versão ≥ 1600 px de largura.
- **Mercado Municipal**: 678 x 452 px, substituiu o Parque Barigui a pedido do grupo (nov/2026).
  O arquivo `parque-barigui.jpg` continua na pasta, sem uso, caso queiram voltar atrás.
- Nenhum crédito/licença foi cadastrado, pois a autoria das imagens não foi informada
  (não foi inventada). Se forem usadas fora do uso escolar, confirme a autoria e preencha `credito`.
- A capa reaproveita a foto do Jardim Botânico; as miniaturas do roteiro reaproveitam as da galeria.
