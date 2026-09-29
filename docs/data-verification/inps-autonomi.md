# INPS autonomi (regime forfettario) — verifica dati

Parametri contributivi per anno usati dal calcolatore forfettario per le quattro gestioni. Dati in `src/data/params/autonomi.ts` (prima fascia e massimale in `src/data/params/inps.ts`, massimale ante 1996 e contributi minimi derivati in `src/data/derived.ts`), bloccati da `src/domain/taxConfig.autonomi.test.ts` e dai casi in `tests/golden/forfettario.golden.test.ts`.

## Artigiani e commercianti

| Anno | Circolare INPS     | Minimale | Prima fascia | Massimale (dal 1996) | Massimale (ante 1996) | Contributo minimo artigiani | Contributo minimo commercianti |
| ---- | ------------------ | -------- | ------------ | -------------------- | --------------------- | --------------------------- | ------------------------------ |
| 2024 | n. 33 del 7/2/2024 | 18.415 € | 55.008 €     | 119.650 €            | 91.680 €              | 4.427,04 €                  | 4.515,43 €                     |
| 2025 | n. 38 del 7/2/2025 | 18.555 € | 55.448 €     | 120.607 €            | 92.413 €              | 4.460,64 €                  | 4.549,70 €                     |
| 2026 | n. 14 del 9/2/2026 | 18.808 € | 56.224 €     | 122.295 €            | 93.707 €              | 4.521,36 €                  | 4.611,64 €                     |

- Aliquote: artigiani 24%, commercianti 24,48%, più un punto oltre la prima fascia; contributo di maternità 7,44 € l'anno (0,62 € al mese).
- Il massimale per chi ha contributi prima del 1996 è la prima fascia più due terzi: la circolare 14/2026 lo scrive per esteso (56.224 + 37.483 = 93.707). Per il 2024 e il 2025 il valore è ricavato con la stessa regola.
- Il contributo minimo è minimale × aliquota + maternità, e coincide con quello pubblicato nelle circolari.
- Riduzione del 35% per i forfettari (L. 190/2014 art. 1 c. 77): si applica all'intero contributo, maternità compresa. I minimi ridotti pubblicati per il 2026 (artigiani 2.939 €, commercianti 2.998 €) sono 4.521,36 × 0,65 e 4.611,64 × 0,65.
- Riduzione del 50% per chi si iscrive per la prima volta dal 2025 (L. 207/2024 art. 1 c. 186), per 36 mesi, alternativa alla riduzione del 35%.

## Gestione Separata

| Anno | Aliquota piena | Aliquota ridotta | Minimale | Massimale |
| ---- | -------------- | ---------------- | -------- | --------- |
| 2024 | 26,07%         | 24%              | 18.415 € | 119.650 € |
| 2025 | 26,07%         | 24%              | 18.555 € | 120.607 € |
| 2026 | 26,07%         | 24%              | 18.808 € | 122.295 € |

La configurazione annuale (`getTaxConfig(anno).gestioneSeparata`) è lo stesso oggetto di `getAutonomiConfig(anno).gestionSeparata`, e il minimale è quello di artigiani e commercianti (`inps.gestioneSeparata.minimale` in `src/data/derived.ts`): una sola fonte.

## Limite di reddito da lavoro dipendente

Chi ha anche un reddito da lavoro dipendente oltre la soglia è escluso dal forfettario: 30.000 € fino al 2024, 35.000 € dal 2025 (L. 207/2024).

## Correzione di settembre 2026

La versione precedente di questa scheda diceva che il 2025 era "identico al 2026" salvo il minimale, e nel codice gli anni 2024 e 2025 erano costruiti copiando il 2026. Risultato: nel 2024 e nel 2025 prima fascia e massimali erano quelli del 2026, il minimale 2024 di artigiani e commercianti era quello del 2023 (17.504 €) e il massimale ante 1996 era 86.334 € in tutti gli anni. Il test `taxConfig.autonomi.test.ts` ora controlla ogni valore contro la circolare dell'anno e verifica che i valori rivalutati crescano da un anno all'altro.

## Cosa il calcolatore non modella

- Le casse professionali (Inarcassa, Cassa Forense, ENPAM e le altre): l'utente inserisce il contributo stimato dalla propria cassa, che il calcolatore usa così com'è.
- I giorni festivi nel riproporzionamento del contributo fisso per mesi di attività.
- La domanda di adesione alla riduzione del 35%, da presentare entro il 28 febbraio.

## Fonti

- Circolare INPS n. 33 del 7/2/2024; n. 38 del 7/2/2025; n. 14 del 9/2/2026 (artigiani e commercianti).
- Circolari INPS annuali sulla Gestione Separata (2024 n. 8; 2025 n. 27; 2026 n. 8).
- L. 190/2014 art. 1 c. 54-89 e 77; L. 207/2024.

## Ultima verifica

2026-09-28
