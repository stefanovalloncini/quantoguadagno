# Detrazioni per spese al 19% — verifica dati

Dati in `src/data/params/deductions.ts` (`deductions.expenses`, `deductions.expensePhaseOut`, `deductions.expenseCap`, `deductions.expenseReduction`), una voce per ogni data in cui cambiano; calcolo in `calculateExpenseDeduction` (`src/domain/deductionCalculations.ts`). Il reddito di riferimento è il reddito complessivo; per gli impatriati quello già ridotto.

## Importi di base (art. 15 TUIR)

- Interessi passivi sul mutuo per l'abitazione principale: 19% fino a 4.000 € di interessi.
- Spese sanitarie: 19% sulla parte oltre la franchigia di 129,11 €.
- Altre spese detraibili al 19%: 19% dell'importo.

## Limiti per redditi alti

Si applicano in quest'ordine:

1. **Tetto alle spese oltre 75.000 € (art. 16-ter TUIR, dal 2025).** Le spese ammesse non possono superare `importo base × coefficiente`: importo base 14.000 € tra 75.000 e 100.000 €, 8.000 € oltre 100.000 €; coefficiente 0,50 senza figli a carico, 0,70 con un figlio, 0,85 con due, 1 con tre o più (o con un figlio disabile). Sono escluse dal tetto le spese sanitarie e gli interessi sui mutui stipulati fino al 31/12/2024, che il calcolatore assume.
2. **Riduzione tra 120.000 e 240.000 € (art. 15 c. 3-bis TUIR, dal 2020).** La detrazione per le altre spese si moltiplica per `(240.000 − reddito) / 120.000` e si azzera oltre 240.000 €. Restano intere quelle per interessi sul mutuo e per spese sanitarie (c. 3-ter).
3. **Riduzione di 440 € oltre 200.000 € (L. 199/2025, dal 2026).** L'ammontare delle detrazioni diverse da quelle per spese sanitarie si riduce di 440 €, senza andare sotto zero.

## Esempi (2026)

| Caso          | Reddito      | Spese                                       | Detrazione                                                                |
| ------------- | ------------ | ------------------------------------------- | ------------------------------------------------------------------------- |
| RAL 90.000 €  | 81.391,24 €  | altre 10.000 €                              | tetto 14.000 × 0,5 = 7.000 → **1.330 €**                                  |
| RAL 150.000 € | 138.100,38 € | mutuo 3.000, sanitarie 1.000, altre 6.000 € | mutuo 570 + sanitarie 165,47 + altre 4.000 × 19% × 0,849 = **1.380,83 €** |
| RAL 260.000 € | 248.100,38 € | mutuo 4.000, sanitarie 2.000, altre 3.000 € | altre azzerate; (760 − 440) + 355,47 = **675,47 €**                       |

Tutti e tre sono casi di test in `tests/golden/employee.golden.test.ts`.

## Limiti noti

- Il coefficiente del tetto usa i figli indicati nel calcolatore, cioè quelli con almeno 21 anni: i figli più piccoli contano per la legge ma il calcolatore non li chiede, quindi per chi li ha il tetto risulta più basso del dovuto.
- Il calcolatore non chiede la data di stipula del mutuo.

## Correzione di settembre 2026

Fino a questa verifica la detrazione per spese non dipendeva dal reddito.

## Fonti

- Art. 15 c. 1, 3-bis e 3-ter TUIR; art. 16-ter TUIR introdotto dalla L. 207/2024; L. 199/2025 (Legge di Bilancio 2026).

## Ultima verifica

2026-09-28
