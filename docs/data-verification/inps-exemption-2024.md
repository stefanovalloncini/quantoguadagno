# Esonero contributivo INPS 2024 — verifica dati

Riferimento normativo: Art. 1, comma 15, L. 213/2023 (Legge di Bilancio 2024). Misura **temporanea, valida solo per il 2024**. Non applicabile a 2025 o 2026.

## Regola

La Circolare INPS n. 11 del 16/01/2024 fissa tre punti:

1. La soglia si confronta con la **retribuzione imponibile del singolo mese**, al netto del rateo di tredicesima e di quattordicesima.
2. L'esonero si applica alle **sole mensilità ordinarie**: tredicesima, quattordicesima e mensilità aggiuntive "non concorrono al raggiungimento del tetto mensile previsto dalla norma e non sono altresì oggetto di esonero".
3. L'entità dell'esonero si decide mese per mese.

| Retribuzione del mese ordinario | Esonero sulla quota IVS del lavoratore |
| ------------------------------- | -------------------------------------- |
| fino a 1.923 €                  | 7 punti                                |
| da 1.923,01 a 2.692 €           | 6 punti                                |
| oltre 2.692 €                   | nessuno                                |

Con una retribuzione uguale ogni mese, la mensilità ordinaria è `RAL / mensilità` e l'esonero annuo è:

```
esonero = aliquota × (RAL / mensilità) × 12
```

L'esonero non può superare i contributi dovuti: per gli apprendisti (5,84%) azzera la quota del lavoratore.

## Esempi di calcolo

### RAL 20.000 €, 12 mensilità

- Mensilità ordinaria 1.666,67 €, sotto 1.923 €.
- Esonero = 7% × 1.666,67 × 12 = **1.400,00 €**.
- INPS netta = 20.000 × 9,19% − 1.400 = 1.838 − 1.400 = **438,00 €**.

### RAL 33.000 €, 13 mensilità

- Mensilità ordinaria 2.538,46 €, tra 1.923 e 2.692 €.
- Esonero = 6% × 2.538,46 × 12 = **1.827,69 €** (la tredicesima è esclusa).

### RAL 35.000 €, 14 mensilità

- Mensilità ordinaria 2.500,00 €.
- Esonero = 6% × 2.500 × 12 = **1.800,00 €** (tredicesima e quattordicesima escluse).

### RAL 45.000 €, 13 mensilità

- Mensilità ordinaria 3.461,54 €, sopra 2.692 €.
- Esonero = **0 €**.

Tutti gli esempi sono casi di test in `tests/golden/employee.golden.test.ts` e `src/domain/inpsExemption2024.test.ts`.

## Correzione di settembre 2026

Fino a questa verifica il calcolatore divideva il lordo annuo per 12 qualunque fosse il numero di mensilità e applicava l'esonero anche alla tredicesima. Con 13 mensilità una RAL di 33.000 € risultava sopra soglia (2.750 € al mese) e perdeva tutto l'esonero; con 13, 15 o 16 mensilità l'esonero, quando spettava, includeva mensilità escluse dalla norma.

## Fonti

- Art. 1, comma 15, L. 213/2023 (Legge di Bilancio 2024).
- Circolare INPS n. 11 del 16/01/2024, paragrafi 3 e 5.

## Ultima verifica

2026-09-28
