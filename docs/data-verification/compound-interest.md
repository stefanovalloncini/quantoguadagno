# Compound interest — verification

The calculator at `/interesse-composto` uses textbook financial mathematics. There is no authoritative external source: the formulas are standard and reproducible from first principles.

## Formula

Given periodic rate `r` (annual rate divided by compounding periods per year), per-period contribution `c`, and `n` total periods, balance evolves as:

```
balance[k+1] = balance[k] * (1 + r) + c
```

with `balance[0] = principal`.

Equivalent closed form for end-of-period contributions:

```
balance[n] = principal * (1 + r)^n  +  c * ((1 + r)^n − 1) / r       (r > 0)
balance[n] = principal             +  c * n                          (r = 0)
```

Real (inflation-adjusted) value at year `y`:

```
real[y] = nominal[y] / (1 + inflationRate)^y
```

## Golden-master vectors

These are the assertions in `src/domain/compoundInterest.test.ts`:

| Scenario                                    | Inputs                                                                                  | Expected                              |
| ------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------- |
| No growth, no contributions                 | `principal=10000`, `rate=0`, `years=10`                                                 | `final=10000`, `interest=0`           |
| Annual compounding                          | `principal=10000`, `rate=0.05`, `years=20`, annual                                      | `final≈26532.98`, `interest≈16532.98` |
| Monthly compounding + monthly contributions | `principal=1000`, `rate=0.06`, `years=5`, contribution `100/month`, monthly compounding | `final≈8325.85`, `contributed=6000`   |
| Inflation-adjusted                          | `principal=10000`, `rate=0.05`, `years=10`, annual, `inflation=0.02`                    | `nominal≈16288.95`, `real≈13362.61`   |
| Yearly contributions                        | `rate=0.05`, `years=3`, contribution `1000/year`                                        | `contributed=3000`, `final>3000`      |
| Contributions disabled                      | contribution `999`, frequency `none`                                                    | `contributed=0`                       |
| Negative inputs clamp to zero               | `principal=-100`, `rate=-0.5`                                                           | `final=0`                             |

## Independent verification

Cross-checked with Excel `FV(rate, nper, pmt, pv, type)` and with an online compound-interest calculator. Values match to 1 cent.

## Notes for the future

- Contributions are applied **at the end** of each compounding period (annuity-immediate).
- `none` contribution frequency overrides the contribution amount: the calculator deliberately ignores whatever value is in the contribution field when the frequency is `none`. This mirrors how the form drives behaviour.
- Daily compounding uses 365 periods per year; leap-year drift is intentionally ignored at the 1-cent rounding level.
