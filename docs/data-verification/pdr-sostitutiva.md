# Premio di Risultato — imposta sostitutiva (PDR)

Verifica della funzione `calculatePremioRisultato` in `src/domain/bonusCalculations.ts` e dei coefficienti `pdrSostitutiva` per gli anni 2024, 2025, 2026.

## Norma di riferimento

- Art. 1, commi 182-189, L. 208/2015 (Legge di Stabilità 2016) — impianto originario, aliquota sostitutiva 10 %.
- L. 197/2022 (Bilancio 2023) — riduzione al 5 % per i premi erogati nel 2023.
- L. 213/2023 (Bilancio 2024) — proroga del 5 % per il 2024.
- L. 207/2024 (Bilancio 2025) — conferma del 5 % per il 2025, tetto €3.000.
- L. 199/2025 (Bilancio 2026) — riduzione al 1 % per il 2026 e 2027, innalzamento del tetto a €5.000.
- AdE Circolare n. 2/E del 24 febbraio 2026 — chiarimenti applicativi.

## Parametri configurati

| Anno | Aliquota sostitutiva | Tetto detassabile |
| ---- | -------------------- | ----------------- |
| 2024 | 5 %                  | €3.000            |
| 2025 | 5 %                  | €3.000            |
| 2026 | 1 %                  | €5.000            |

I tre valori sono le voci del parametro `pdr` in `src/data/params/specialConditions.ts`, letto come `pdrSostitutiva`.

## Formula

Il calcolo applica:

1. **INPS dipendente** sull'intero premio lordo, all'aliquota standard del lavoratore. La parte INPS non beneficia mai dell'imposta sostitutiva.
2. **Imposta sostitutiva** sulla parte `min(premio, tetto)`, calcolata su `eligibleGross × (1 − inpsRate)`. Cioè la base è il premio netto-INPS entro il tetto, all'aliquota dell'anno.
3. **IRPEF ordinaria** sull'eventuale eccedenza oltre il tetto, all'aliquota marginale del reddito imponibile corrente. Anche qui base = `excessGross × (1 − inpsRate)`.
4. **Netto** = `gross − inps − totalTax`.

In codice:

```ts
const pdrInps = pdrGross * inpsStandardRate;
const eligibleGross = Math.min(pdrGross, cfg.maxAmount);
const excessGross = Math.max(0, pdrGross - cfg.maxAmount);
const substitutiveTax = eligibleGross * (1 - inpsStandardRate) * cfg.rate;
const marginalRate = getMarginalRate(taxableIncome, irpefBrackets);
const excessTax = excessGross * (1 - inpsStandardRate) * marginalRate;
```

## Golden master

I vettori in `bonusCalculations.test.ts` lockano il calcolo contro la formula sopra per:

- premio sotto il tetto (2026 + 2025);
- premio esattamente al tetto;
- premio oltre il tetto con marginale IRPEF al 23 %, 33 %, 43 % (anno 2026);
- premio sotto e sopra il tetto in regime 2025.

I numeri sono derivati a mano dalla formula, non importati da una terza fonte: la verifica è interna alla coerenza della funzione, non incrociata con un calcolatore esterno. Un secondo passo di cross-check con il foglio di calcolo della CGIL o di un commercialista è auspicabile prima di promettere accuratezza fiscale al pubblico.

## Limiti noti

- **Soglia di reddito €80.000 (anno precedente)** — la norma richiede che il lavoratore abbia percepito nell'anno precedente un reddito di lavoro dipendente ≤ €80.000. Il calcolo attuale **non** verifica questa condizione: applica l'imposta sostitutiva indipendentemente dall'imponibile corrente o passato. Per utenti oltre soglia il calcolo sovrastima il netto. Backlog separato.
- **Tetto €4.000 per coinvolgimento paritetico dei lavoratori** — la norma prevede un tetto elevato a €4.000 (regime 2025) o a una quota maggiorata in caso di accordo aziendale con partecipazione. Il calcolo usa il tetto base. Backlog separato.
- **Cumulo con welfare aziendale** — il premio può essere convertito in welfare entro lo stesso tetto, mantenendo l'esenzione. Non modellato.
- **Lavoratori del settore pubblico** — la sostitutiva si applica solo al settore privato. Il calcolo non distingue: se `isPublicEmployee = true` ma viene comunque inserito un premio, l'app calcola la sostitutiva. Da risolvere quando rivedremo l'input.
