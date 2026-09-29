# Trattamento integrativo — verifica dati

Riferimento normativo: Art. 1 D.L. 3/2020 (cd. "bonus 100 euro"), modificato dalla L. 234/2021 e reso stabile per il meccanismo di capienza dalla L. 207/2024. Importi e soglie identici per 2024, 2025 e 2026.

## Regola

| Reddito complessivo     | Spetta                                                                                                   | Importo                                  |
| ----------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| fino a 15.000 €         | solo se l'imposta lorda supera la detrazione per lavoro dipendente (art. 13 c. 1 TUIR) diminuita di 75 € | 1.200 €                                  |
| da 15.000,01 a 28.000 € | solo se le detrazioni elencate dalla norma superano l'imposta lorda                                      | `min(1.200; detrazioni − imposta lorda)` |
| oltre 28.000 €          | no                                                                                                       | 0 €                                      |

La condizione di capienza sotto i 15.000 € esclude chi ha un'imposta già azzerata dalla detrazione: con la detrazione piena di 1.955 € serve un'imposta lorda superiore a 1.880 €, cioè un imponibile oltre 8.173,91 € circa.

Detrazioni che contano tra 15.000 e 28.000 €, come le considera il calcolatore:

- detrazione per lavoro dipendente dell'art. 13 c. 1 TUIR, **senza** i 65 € del c. 1.1;
- detrazioni per familiari a carico (art. 12 TUIR);
- interessi passivi sul mutuo (art. 15 c. 1 lett. a e b), che la norma ammette per i mutui stipulati fino al 31/12/2021; il calcolatore non chiede la data e li include;
- l'ulteriore detrazione del taglio del cuneo (L. 207/2024 c. 6), dal 2025.

Non contano le spese sanitarie dell'anno né le altre spese al 19%.

Per la soglia si usa il reddito complessivo comprensivo della quota esente degli impatriati.

## Da verificare

- Se l'ulteriore detrazione del cuneo rientri tra le detrazioni che danno diritto al trattamento parziale. La Circolare AdE 4/E del 16/05/2025 tratta le due misure ma non è stata trovata una frase esplicita; il calcolatore la include.

## Esempi di calcolo

### 2026, RAL 15.000 €

- Imponibile 13.621,50 €, imposta lorda 3.132,95 €, detrazione 1.955 €.
- 3.132,95 > 1.955 − 75 = 1.880, quindi spetta: **1.200 €**.

### 2026, RAL 8.000 €

- Imponibile 7.264,80 €, imposta lorda 1.670,90 €.
- 1.670,90 ≤ 1.880, quindi non spetta: **0 €**.
- Senza IRPEF netta non sono dovute nemmeno le addizionali (vedi `regional-brackets.md`): il netto è 7.780,60 €.

### Reddito 30.000 €

- Sopra la soglia: **0 €**.

Gli esempi sono casi di test in `tests/golden/employee.golden.test.ts` e `src/domain/trattamentoIntegrativo.test.ts`.

## Correzione di settembre 2026

Fino a questa verifica il calcolatore riconosceva i 1.200 € a chiunque avesse un reddito fino a 15.000 €, senza la condizione di capienza, e tra 15.000 e 28.000 € contava tutte le detrazioni, spese sanitarie comprese. Con una RAL di 8.000 € il netto mostrato superava il lordo (8.833,13 €).

## Fonti

- Art. 1 D.L. 3/2020 convertito in L. 21/2020.
- Art. 1 c. 3 L. 234/2021 (Legge di Bilancio 2022).
- Agenzia delle Entrate, Circolare 4/E del 18/02/2022 e Circolare 4/E del 16/05/2025.

## Ultima verifica

2026-09-28
