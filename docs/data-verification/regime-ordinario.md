# Regime ordinario: verifica dati

Regole e parametri del calcolatore per la partita IVA in regime ordinario: professionista, o ditta
individuale in contabilità semplificata. La detrazione per lavoro autonomo e impresa minore sta in
`src/data/params/irpef.ts` (`irpef.selfEmployedDeduction`); contributi, scaglioni e addizionali
sono quelli già verificati nelle schede `inps-autonomi.md`, `irpef.md` e `regional-brackets.md`.

## Detrazione per lavoro autonomo e impresa minore

Art. 13, commi 5, 5-ter e 6 del TUIR (D.P.R. 917/1986), nel testo scritto dall'art. 1, comma 2,
lettera b), numeri 5 e 6 della L. 234/2021, in vigore dal 2022. Controllato su Normattiva il 20
ottobre 2026 nelle tre versioni dell'articolo che coprono gli anni supportati: in vigore dal 1°
gennaio 2022 al 30 dicembre 2023, dal 31 dicembre 2023 al 31 dicembre 2024, dal 1° gennaio 2025
al 31 dicembre 2026. Il testo dei commi 5, 5-ter e 6 è lo stesso in tutte e tre.

| Reddito complessivo          | Detrazione                              | Norma              |
| ---------------------------- | --------------------------------------- | ------------------ |
| fino a 5.500 €               | 1.265 €                                 | c. 5, lett. a)     |
| oltre 5.500 e fino a 28.000  | 500 + 765 × (28.000 − reddito) / 22.500 | c. 5, lett. b)     |
| oltre 28.000 e fino a 50.000 | 500 × (50.000 − reddito) / 22.000       | c. 5, lett. b-bis) |
| oltre 50.000 €               | nessuna                                 |                    |

Più 50 € se il reddito complessivo è superiore a 11.000 € e non supera 17.000 € (c. 5-ter).

- **Su quale reddito.** La norma usa il reddito complessivo: la somma dei redditi (art. 8 TUIR),
  prima degli oneri deducibili, che l'art. 10 c. 1 toglie "dal reddito complessivo". I contributi
  previdenziali obbligatori sono uno di questi oneri (art. 10 c. 1 lett. e)). L'IRPEF lorda invece
  si calcola "al reddito complessivo, al netto degli oneri deducibili" (art. 11 c. 1). Le istruzioni
  del modello Redditi PF (fascicolo 1, rigo RN7, colonne 3 e 4) e le specifiche tecniche (par.
  21.4) lo confermano: il reddito per le detrazioni è il rigo RN1 meno la deduzione per
  l'abitazione principale (RN2), senza togliere gli oneri deducibili del rigo RN3. Con la sola
  partita IVA il reddito complessivo è compensi o ricavi meno costi, prima dei contributi.
- **Quattro decimali.** Il comma 6: se il risultato dei rapporti è maggiore di zero, "lo stesso si
  assume nelle prime quattro cifre decimali". Le specifiche tecniche: "devono essere utilizzate le
  prime quattro cifre decimali". Il calcolatore tronca il quoziente alla quarta cifra, senza
  arrotondare.
- **I 50 € del comma 5-ter** valgono anche per il lavoro autonomo e per l'impresa minore: la
  circolare 4/E del 18 febbraio 2022 (par. 1.2.3) li elenca tra le novità del regime delle
  detrazioni "per i redditi di lavoro autonomo e altri redditi", e le specifiche tecniche li
  sommano nel calcolo del rigo RN7, colonna 4. Le istruzioni del fascicolo 1 hanno una frase che
  sembra limitarli ai redditi dell'art. 50: si è seguita la norma, la circolare e le specifiche.
- **Non cumulabile** con le detrazioni per lavoro dipendente e per pensione (c. 5). Il calcolatore
  assume che la partita IVA sia l'unico reddito dell'anno.
- **Non diventa un credito.** La detrazione non può superare l'imposta lorda: la parte in eccesso si
  perde.

### Esempi svolti

- Reddito 16.000 €: (28.000 − 16.000) / 22.500 = 0,53333… → 0,5333; 500 + 765 × 0,5333 = 907,97;
  più 50 € perché 16.000 è oltre 11.000 e fino a 17.000: **957,97 €**. Con il quoziente
  arrotondato invece che troncato sarebbero 958,00 €.
- Reddito 35.000 €: (50.000 − 35.000) / 22.000 = 0,681818… → 0,6818; 500 × 0,6818 = **340,90 €**.
- Reddito 40.000 €: (50.000 − 40.000) / 22.000 = 0,454545… → 0,4545; 500 × 0,4545 = **227,25 €**.
- Reddito 6.000 €: (28.000 − 6.000) / 22.500 = 0,97777… → 0,9777; 500 + 765 × 0,9777 =
  **1.247,94 €**.

## Fonti

- D.P.R. 22 dicembre 1986, n. 917 (TUIR), art. 13 c. 5, 5-ter e 6, su Normattiva:
  https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.del.presidente.della.repubblica:1986-12-22;917~art13
  (versioni lette aggiungendo `!vig=2022-06-30`, `!vig=2024-06-30` e `!vig=2026-10-20`).
- TUIR, art. 8 (reddito complessivo), art. 10 c. 1 lett. e) (contributi tra gli oneri deducibili),
  art. 11 c. 1 (imposta lorda sul reddito al netto degli oneri deducibili), su Normattiva.
- L. 30 dicembre 2021, n. 234, art. 1 c. 2 lett. b) n. 5 e 6 (G.U. n. 310 del 31 dicembre 2021,
  S.O. n. 49): https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:2021-12-30;234
- Agenzia delle Entrate, circolare n. 4/E del 18 febbraio 2022, par. 1.2.3:
  https://www.agenziaentrate.gov.it/portale/documents/20143/4169770/Circolare+n.+4+del+18+febbraio+2022.pdf/a83fd984-2bc3-39a9-1e09-79e9a870d401
- Agenzia delle Entrate, istruzioni Redditi PF 2026, fascicolo 1, righi da RN1 a RN7 (le istruzioni
  Redditi PF 2025 hanno lo stesso testo):
  https://www.agenziaentrate.gov.it/portale/documents/d/guest/pf1_istruzioni_2026_agg-28-05-2026
- Agenzia delle Entrate, specifiche tecniche Redditi PF 2026, par. 21.4:
  https://www.agenziaentrate.gov.it/portale/documents/d/guest/specifiche_tecniche_redditi_pf_2026_agg-13-04-2026

## Ultima verifica

2026-10-20
