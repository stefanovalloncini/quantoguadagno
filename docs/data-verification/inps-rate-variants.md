# INPS — varianti di aliquota dipendente — verifica dati

Estende `inps.md` con le aliquote alternative selezionabili dal calcolatore: contratto di apprendistato, addizionale CIGS per aziende oltre i 15 dipendenti, gestione dipendenti pubblici.

## Aliquote

| Caso                                               | Aliquota lavoratore | Note                                                  |
| -------------------------------------------------- | ------------------- | ----------------------------------------------------- |
| Standard, settore privato                          | 9,19%               | Vedi `inps.md`.                                       |
| Apprendistato                                      | 5,84%               | Aliquota agevolata per tutta la durata del contratto. |
| Azienda industriale con più di 15 dipendenti       | 9,49%               | Standard 9,19% + addizionale CIGS 0,30%.              |
| Dipendente pubblico (Gestione Dipendenti Pubblici) | 8,80%               | Aliquota IVS ex-INPDAP.                               |

Le aliquote restano costanti per gli anni fiscali 2024, 2025, 2026 (le revisioni INPS recenti hanno toccato massimali e prima fascia, non queste aliquote).

## Addizionale CIGS — 0,30%

Imponibile su tutta la RAL fino al massimale contributivo. Si applica ai lavoratori di aziende industriali con organico medio superiore a 15 dipendenti, in quanto soggette alla Cassa Integrazione Guadagni Straordinaria.

Esempio 2026, RAL 30.000 €, azienda > 15:

- Standard: 30.000 × 9,19% = 2.757,00 €
- Addizionale CIGS: 30.000 × 0,30% = 90,00 €
- Totale lavoratore: **2.847,00 €** (= 30.000 × 9,49%)

## Aliquota dipendenti pubblici — 8,80%

Si applica ai dipendenti iscritti alla Gestione Dipendenti Pubblici INPS (ex-INPDAP). L'imposizione è sull'intera RAL fino al massimale; non si applica l'addizionale CIGS perché lo schema CIGS non riguarda il pubblico impiego.

Esempio 2026, RAL 30.000 €, dipendente pubblico:

- INPS = 30.000 × 8,80% = **2.640,00 €**

## Override manuale

Quando attivato, l'utente fornisce direttamente aliquota lavoratore e aliquota datore. Le aliquote di configurazione e le regole sopra vengono ignorate. Utile per CCNL con aliquote non standard (es. agricoltura, autoferrotranvieri, alcune categorie del commercio).

## Fonti

- Art. 9 c. 1 Legge 29 dicembre 1990 n. 407 — addizionale CIGS 0,30% (introduzione).
- Circolare INPS n. 21/2024 (par. "Contribuzione minore: CIGS"), n. 26/2025, n. 6/2026 — conferma annuale dell'aliquota CIGS.
- Art. 22 Legge 8 agosto 1995 n. 335 — Gestione Dipendenti Pubblici, aliquota IVS.
- Circolare INPS n. 64/2024, n. 60/2025 — aliquote contributive Gestione Dipendenti Pubblici. https://www.inps.it/it/it/dettaglio-approfondimento.schede-informative.49902.i-contributi-dei-dipendenti-pubblici.html

## Ultima verifica

2026-05-17
