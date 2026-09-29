# Tredicesima netta — verifica dati

Riferimento normativo: Art. 51 TUIR (la tredicesima è reddito di lavoro
dipendente, imponibile IRPEF e INPS). La gratifica natalizia matura su 12 mesi
ed è pari a una mensilità della retribuzione.

## Perché la tredicesima è tassata di più di una mensilità ordinaria

- **INPS**: si applica come su una normale retribuzione (9,19% a carico del
  dipendente nel caso standard).
- **IRPEF**: si applica all'aliquota marginale del contribuente, perché la
  tredicesima si somma al reddito annuo.
- **Detrazioni**: le detrazioni da lavoro dipendente e per carichi di famiglia
  sono rapportate ai 12 mesi e **non** spettano sulla tredicesima. Senza
  detrazioni a ridurla, l'IRPEF sulla tredicesima è piena.
- **Addizionali**: le addizionali regionale e comunale **non** si trattengono
  sulla tredicesima (sono versate in rate sul reddito annuo).

## Formula

```
lordo tredicesima = RAL / mensilità
INPS              = lordo × aliquota INPS
imponibile        = lordo − INPS
IRPEF             = imponibile × aliquota marginale (sul reddito annuo imponibile)
netto             = lordo − INPS − IRPEF
```

L'aliquota marginale è quella dello scaglione in cui cade il reddito annuo
imponibile (RAL al netto dei contributi). Con 14 mensilità la quattordicesima
si calcola allo stesso modo.

## Esempi di calcolo (golden vectors)

### RAL 30.000 €, 13 mensilità, INPS 9,19%, scaglioni 2025

- Lordo = 30.000 / 13 = 2.307,69 €
- INPS = 2.307,69 × 9,19% = 212,08 €
- Imponibile = 2.095,61 €
- Reddito annuo imponibile ≈ 27.243 € → marginale **23%**
- IRPEF = 2.095,61 × 23% = 481,99 €
- Netto = **1.613,62 €** (prelievo effettivo ≈ 30,1%)

### RAL 60.000 €, 13 mensilità, scaglioni 2025

- Lordo = 4.615,38 €, INPS = 424,15 €, imponibile = 4.191,23 €
- Reddito annuo imponibile ≈ 54.486 € → marginale **43%**
- IRPEF = 1.802,23 € → Netto = **2.389,00 €**

### RAL 40.000 €, 13 mensilità — effetto del taglio 2026

- Marginale 2025 = 35%, 2026 = 33% (secondo scaglione ridotto).
- A parità di RAL la tredicesima 2026 lascia più netto della 2025.
