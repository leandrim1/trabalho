#!/usr/bin/env python3
"""Compara o texto do PDF original com o do PDF novo (palavra por palavra).

Mostra o que existe no original e NÃO aparece no novo (e vice-versa), para
garantir que nenhum conteúdo acadêmico ou valor foi perdido ou alterado.
Uso: python3 src/verificar_textos.py
"""
import re, subprocess, sys
from collections import Counter
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
ORIGINAL = RAIZ / "referencia" / "trabalho_viagem_curitiba_original.pdf"
NOVO = RAIZ / "viagem_curitiba_grupo9.pdf"

def texto(pdf):
    return subprocess.run(["pdftotext", str(pdf), "-"], capture_output=True, text=True, check=True).stdout

def tokens(t):
    t = t.replace("­", "").replace("\xa0", " ")
    return Counter(re.findall(r"\S+", t))

# Valores do quadro de orçamento revisados pelo grupo em nov/2026 (foto enviada).
# A ausência destes números do PDF original é esperada: eles foram substituídos.
SUBSTITUIDOS = {
    "350", "900", "1.750", "1.100", "200", "450", "50", "600",
    "1.475", "2.550", "4.300", "2.950", "5.100", "8.600",
    "245,83", "425,00", "716,67", "491,67", "850,00", "1.433,33",
}

orig, novo = tokens(texto(ORIGINAL)), tokens(texto(NOVO))
faltam = orig - novo
sobram = novo - orig
esperados = {w: n for w, n in faltam.items() if w in SUBSTITUIDOS}
reais = {w: n for w, n in faltam.items() if w not in SUBSTITUIDOS}
print("== Presentes no ORIGINAL e ausentes no NOVO ==")
for w, n in sorted(reais.items()): print(f"  {w!r} x{n}")
print("\n== Ausências esperadas (valores do orçamento revisados) ==")
print("  " + " ".join(sorted(esperados)) if esperados else "  (nenhuma)")
print("\n== Presentes só no NOVO (acréscimos de design) ==")
print("  " + " ".join(f"{w}" + (f"(x{n})" if n > 1 else "") for w, n in sorted(sobram.items())))
