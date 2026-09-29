# Preavviso dimissioni — verification

Notice periods for voluntary resignation (dimissioni) by the employee, broken down by CCNL, livello and seniority band.

## Sources

- **Commercio e Terziario (Confcommercio)** — Art. 254 CCNL Terziario Confcommercio-Cgil-Cisl-Uil. Reference: `contrattocommercio.it/art-254-dimissioni-e-preavviso/`. Counted in calendar days; notice runs from the 1st or 16th of the month following communication (we render the simpler "from the resignation date" approximation, as the 1st/16th rule is purely a decorrenza convention and the total duration is unchanged).
- **Metalmeccanici Industria (Federmeccanica)** — Art. 1 della Sez. Tit. VI CCNL Federmeccanica. Reference: `contrattometalmeccanici.it/art-1-preavviso-di-licenziamento-e-di-dimissioni/`. Areas: A = quadri (highest), D = operai (lowest).
- **Logistica, Trasporto Merci e Spedizione** — Art. 113 CCNL Logistica-Trasporto-Spedizione. Reference: `contrattotrasporti.it/art-113-preavviso-licenziamento-dimissioni/`. Notes: dimissioni = licenziamento halved for impiegati. Operai non-viaggianti use **working days**, not calendar days.
- **Cooperative Sociali** — Art. 33 CCNL Cooperative Sociali. Reference: `ccnlcooperative.it/art-33-preavviso-licenziamento-dimissioni/`. Two seniority bands only (≤3y and >3y).

## Tables

### Commercio e Terziario

| Livello     | < 5 y | 5–10 y | > 10 y |
| ----------- | ----- | ------ | ------ |
| Quadro / 1° | 45    | 60     | 90     |
| 2° / 3°     | 20    | 30     | 45     |
| 4° / 5°     | 15    | 20     | 30     |
| 6° / 7°     | 10    | 15     | 15     |

### Metalmeccanici Industria

| Area                        | < 5 y | 5–10 y | > 10 y |
| --------------------------- | ----- | ------ | ------ |
| A1 (quadri)                 | 60    | 90     | 120    |
| B1–B3 (impiegati direttivi) | 60    | 90     | 120    |
| C1–C3 (intermedi)           | 45    | 60     | 75     |
| D1–D2 (operai)              | 10    | 20     | 30     |

### Logistica, Trasporto Merci e Spedizione

| Categoria                      | < 5 y | 5–10 y | > 10 y |
| ------------------------------ | ----- | ------ | ------ |
| Quadri / Impiegati 1°          | 37    | 52     | 67     |
| Impiegati 2°                   | 22    | 30     | 37     |
| Impiegati 3°S / 3° / 4°        | 15    | 22     | 30     |
| Personale viaggiante           | 15    | 15     | 15     |
| **Operai (giorni lavorativi)** | 6     | 6      | 6      |

### Cooperative Sociali

| Livello                | ≤ 3 y | > 3 y |
| ---------------------- | ----- | ----- |
| A1 / A2 / B1 / C1      | 15    | 30    |
| C2                     | 30    | 45    |
| C3 / D1 / D2 / D3 / E1 | 45    | 60    |
| E2 / F1 / F2           | 90    | 120   |

## Implementation notes

- Seniority is computed as `(resignationDate − hireDate) / 365.2425 days`. The boundaries of the bands are inclusive on the upper end (5–10 means `years ∈ (5, 10]`); the `<5` bucket is strict.
- Calendar days: `setUTCDate(getUTCDate() + days)`.
- Working days: skip Saturdays (`getUTCDay() === 6`), Sundays (`getUTCDay() === 0`), and Italian national holidays. The holiday set is the 12 national festivities established by D.P.R. 792/1985 (Capodanno, Epifania, Pasqua, Pasquetta, 25 aprile, 1 maggio, 2 giugno, Ferragosto, Tutti i Santi, Immacolata, Natale, Santo Stefano). Easter is computed via the anonymous Gregorian algorithm. Patron-saint days (e.g. San Giovanni a Firenze, Sant'Ambrogio a Milano) are intentionally not subtracted — they vary by comune and the calculator does not collect comune.
- Decorrenza rules (start on 1st or 16th of the following month for impiegati Commercio and Logistica) are intentionally not modelled — they change the start date by at most 15 days but not the notice duration. Surfacing them in copy would create false precision in a calculator that doesn't know the time-of-day of communication.

## Known stipendee.it errors not replicated

- Metalmeccanici: stipendee.it puts D1/D2/C1 in the same "operai" bucket. C1 is intermediate (Area C) per Federmeccanica. We keep C1–C3 together and D1–D2 separate.
- Cooperative Sociali: stipendee.it shows 180 days for E2/F1/F2 over 3 years. The contract Art. 33 specifies 120 days. We use 120.
