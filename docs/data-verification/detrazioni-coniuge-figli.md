# Detrazioni per coniuge e figli a carico — TUIR art. 12 c.1 lett. a e c

Dati in `src/data/params/deductions.ts` (`deductions.spouse`, `deductions.children`), calcolo in
`calculateDependentsDeduction` (`src/domain/deductionCalculations.ts`). Il reddito di
riferimento è il reddito complessivo; per gli impatriati quello già ridotto della quota esente.

## Coniuge a carico (lett. a)

| Reddito complessivo  | Detrazione                        |
| -------------------- | --------------------------------- |
| fino a 15.000 €      | 800 − 110 × reddito / 15.000      |
| da 15.000 a 40.000 € | 690, più le maggiorazioni sotto   |
| da 40.000 a 80.000 € | 690 × (80.000 − reddito) / 40.000 |
| oltre 80.000 €       | 0                                 |

Maggiorazioni (art. 12 c.1 lett. a, ultimo periodo): +10 € tra 29.000 e 29.200; +20 € tra 29.200
e 34.700; +30 € tra 34.700 e 35.000; +20 € tra 35.000 e 35.100; +10 € tra 35.100 e 35.200.

Il coniuge è a carico se il suo reddito non supera 2.840,51 €.

### Esempi

- Reddito 12.000 €: 800 − 110 × 0,8 = **712 €**.
- Reddito 30.000 €: 690 + 20 = **710 €**.
- Reddito 45.405 €: 690 × 34.595 / 40.000 = **596,76 €** (caso RAL 50.000 € 2026 in
  `tests/golden/employee.golden.test.ts`).

## Figli a carico (lett. c)

Dal 2022 la detrazione riguarda solo i figli di almeno 21 anni: sotto quell'età c'è l'Assegno
Unico. Dal 2025 (L. 207/2024) spetta per i figli tra 21 e 29 anni, e senza limiti di età per i
figli disabili.

```
detrazione = figli × 950 × (K − reddito) / K,   K = 95.000 + 15.000 × (figli − 1)
```

Se il rapporto è zero o negativo la detrazione non spetta.

### Esempi

- Un figlio, reddito 30.000 €: 950 × 65.000 / 95.000 = **650 €**.
- Due figli, reddito 22.702,50 €: 1.900 × 87.297,50 / 110.000 = **1.507,87 €**, che insieme ai
  690 € del coniuge fa 2.197,87 € (caso RAL 25.000 € 2026 nel golden).

## Correzione di settembre 2026

Fino a questa verifica il calcolatore dava 800 € fissi al coniuge fino a 15.000 €, 690 € fino a
80.000 € e poi li riduceva fino a 120.000 €; ai figli dava 950 € pieni fino a 95.000 € e li
riduceva fino a 120.000 €. Entrambe le regole non corrispondono all'art. 12: a 30.000 € di reddito
un figlio vale 650 €, non 950 €.

## Limiti noti

- Il calcolatore non chiede l'età dei figli né se sono disabili: il testo sotto il campo spiega chi
  contare, e cambia con l'anno scelto.
- La ripartizione della detrazione per i figli tra i genitori (50% ciascuno di norma) non è
  modellata: si assume che il contribuente la prenda per intero.

## Fonti

- Art. 12 TUIR (DPR 917/1986), come modificato dal D.Lgs. 230/2021 e dalla L. 207/2024.

## Ultima verifica

2026-09-28
