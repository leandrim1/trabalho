#!/usr/bin/env python3
"""Confere se todas as palavras do texto original aparecem no PDF gerado."""
import re, subprocess, unicodedata
from collections import Counter
from pathlib import Path
R = Path(__file__).resolve().parent.parent
def toks(t):
    t = unicodedata.normalize("NFC", t).lower().replace("­", "")
    return Counter(re.findall(r"[\wáàâãéêíóôõúç]+", t))
orig = toks((R / "referencia" / "texto_original.txt").read_text(encoding="utf8"))
novo = toks(subprocess.run(["pdftotext", str(R / "melancia_e_os_rins.pdf"), "-"],
                           capture_output=True, text=True, check=True).stdout)
falta = orig - novo
print("Palavras do original ausentes no PDF:", dict(falta) if falta else "NENHUMA")
