# NASpI — verification

Indennità di disoccupazione for involuntarily terminated employees.

## Sources

- **Circolare INPS n. 4 del 28/01/2026** — rivalutazione 2026 (+1,40 % ISTAT). Sets `soglia = €1.456,72`, `massimale = €1.584,70`.
- **Circolare INPS n. 25/2025** — 2025 parameters.
- **Circolare INPS n. 26/2024** — 2024 parameters.
- **D.Lgs. 22/2015** artt. 3-7 — formula and conditions.
- **Legge di Bilancio 2025 (L. 207/2024) art. 1 c. 171** — the "13 fresh weeks after voluntary resignation" lockout rule applicable from 2025 onward.

## Parameters per year

| Year | Soglia     | Massimale  | Notes              |
| ---- | ---------- | ---------- | ------------------ |
| 2024 | € 1.425,21 | € 1.550,42 | INPS Circ. 26/2024 |
| 2025 | € 1.436,78 | € 1.562,82 | INPS Circ. 25/2025 |
| 2026 | € 1.456,72 | € 1.584,70 | INPS Circ. 4/2026  |

## Formula

Let:

- `weeks` = weeks of contribution in the last 4 years
- `gross4y` = sum of imponibile retributions in those 4 years
- `R = (gross4y / weeks) × 52/12` — reference monthly pay
- `S = soglia`, `M = massimale` (year-specific)

Monthly amount (before décalage):

```
if R ≤ S:  monthly = 0.75 × R
else:      monthly = 0.75 × S + 0.25 × (R − S)
monthly = min(monthly, M)
```

Duration in weeks: `min(floor(weeks / 2), 104)`.

Duration in months: `floor(durationWeeks / (52/12))`.

Décalage (compound 3 % per month):

```
startMonth = age ≥ 55 ? 8 : 6
for m in 1..durationMonths:
  steps = m < startMonth ? 0 : m − startMonth + 1
  amount[m] = monthly × (1 − 0.03)^steps
```

## Eligibility

- ≥ 13 weeks of contribution in the last 4 years.
- If voluntary resignation in the last 12 months from a permanent contract, ≥ 13 weeks must have accrued **after** that resignation.
- (Not modelled here: DID filing, 68-day claim window — these are procedural, not amounts.)

## Worked examples (golden masters in `naspi.test.ts`)

**R below soglia.** `gross4y = €46.000`, `weeks = 200`, year 2026:

- `R = 46.000 / 200 × 52/12 ≈ 996.67`
- below soglia → `monthly = 0.75 × 996.67 ≈ 747.50`

**R above soglia.** `gross4y = €100.000`, `weeks = 200`, year 2026:

- `R = 100.000 / 200 × 52/12 ≈ 2.166.67`
- above soglia → `monthly = 0.75 × 1.456,72 + 0.25 × (2.166,67 − 1.456,72)`
- `= 1.092,54 + 177,49 ≈ 1.270,03`

**Cap applies.** `gross4y = €300.000`, `weeks = 200`, year 2026:

- `R = 6.500`, formula gives 2.353,36, capped at `1.584,70`.

**Décalage for under-55.** With monthly 1.270,03:

- m1..m5: 1.270,03 (flat)
- m6: 1.270,03 × 0,97 ≈ 1.231,93
- m7: × 0,97 again ≈ 1.194,97

## Variants intentionally out of scope

- **NASpI agricola** — separate scheme (DS Agricola), different parameters.
- **Net amount** — NASpI is subject to IRPEF; the gross amount can be passed through the IRPEF module already in this repo to compute the net. Out of scope for V1: we display gross only.
