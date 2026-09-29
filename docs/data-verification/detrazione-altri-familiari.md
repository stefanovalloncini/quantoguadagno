# Detrazione per altri familiari a carico — TUIR art. 12 c.1 lett. d

## Norma

Testo Unico delle Imposte sui Redditi (DPR 917/1986), art. 12, c.1 lett. d:

> Per ogni altra persona indicata nell'art. 433 c.c. che conviva con il contribuente o percepisca assegni alimentari non risultanti da provvedimenti dell'autorità giudiziaria, la detrazione spetta nella misura di 750 euro, da ripartire pro quota tra coloro che ne hanno diritto.

E art. 12, c.4-bis:

> La detrazione di cui al comma 1 spetta in misura proporzionale al rapporto tra l'importo di 80.000 euro, diminuito del reddito complessivo, e 80.000 euro. Se il predetto rapporto è pari o minore di zero, la detrazione non compete.

## Dal 2025: solo ascendenti conviventi

La L. 207/2024 (Legge di Bilancio 2025) limita la detrazione per "altri familiari" agli
**ascendenti conviventi** con il contribuente (genitori, nonni). Per il 2024 vale ancora l'elenco
dell'art. 433 c.c. riportato sotto. Il calcolatore mostra il testo giusto per l'anno scelto.

## Familiari ammissibili fino al 2024 (art. 433 c.c.)

Gli "altri familiari" diversi dal coniuge e dai figli sono quelli indicati nell'art. 433 c.c.:

- Genitori e ascendenti prossimi (nonni)
- Suoceri (genitori del coniuge)
- Adottanti e adottati
- Fratelli e sorelle, anche unilaterali
- Generi e nuore

Devono convivere con il contribuente **oppure** ricevere da lui un assegno alimentare non risultante da provvedimenti dell'autorità giudiziaria.

Limite di reddito del familiare: €2.840,51 lordi annui (€4.000 per figli fino a 24 anni — non rilevante qui).

## Formula

```
detrazione = numFamiliari × 750 × max(0, (80.000 − redditoComplessivo) / 80.000)
```

| Reddito complessivo | Coefficiente | Detrazione per familiare |
| ------------------- | ------------ | ------------------------ |
| €0                  | 1,00         | €750                     |
| €20.000             | 0,75         | €562,50                  |
| €40.000             | 0,50         | €375                     |
| €60.000             | 0,25         | €187,50                  |
| €80.000             | 0,00         | €0                       |
| > €80.000           | 0,00         | €0                       |

## Implementazione

`calculateDependentsDeduction` in `src/domain/deductionCalculations.ts`:

```ts
const others =
  dependents.otherDependents > 0
    ? dependents.otherDependents *
      cfg.otherFamilyDeduction *
      taperedShare(income, cfg.otherFamilyPhaseOutEnd)
    : 0;
```

`cfg.otherFamilyDeduction = 750` e `cfg.otherFamilyPhaseOutEnd = 80_000` (parametro
`deductions.otherFamily` in `src/data/params/deductions.ts`). Il reddito usato è quello complessivo: per gli impatriati, quello
già ridotto della quota esente.

Golden vectors in `src/domain/deductionCalculations.test.ts` coprono reddito 0, 40k, 60k, 80k, 100k, e cumulo per più familiari.

## Limiti noti

- **Ripartizione pro quota** — la norma prevede la ripartizione tra più aventi diritto. L'app non chiede se ci sono altri contribuenti che dichiarano lo stesso familiare; assume detrazione piena. Backlog separato per supportare la quota parziale.
- **Verifica condizione (convivenza / assegno alimentare)** — l'app non chiede di confermare la condizione, assume rispetto da parte dell'utente. Hint nella UI esplicita le condizioni.
- **Limite reddito del familiare €2.840,51** — non verificato dall'app; l'utente è responsabile di includere solo familiari che rispettano il limite.

## Ultima verifica

2026-09-28
