# Inflazione (FOI) — verifica dati

L'app usa l'indice ISTAT FOI al netto dei tabacchi (prezzi al consumo per le famiglie di operai e
impiegati), lo stesso che ISTAT usa per le rivalutazioni monetarie e che la legge usa per il TFR,
gli affitti e gli assegni. Dati in `src/data/inflation.ts`.

## Medie annue, base 2015 = 100

| Anno | Indice | Variazione  |
| ---- | ------ | ----------- |
| 2015 | 100,0  |             |
| 2016 | 99,9   | −0,1%       |
| 2017 | 101,1  | +1,2%       |
| 2018 | 102,2  | +1,1%       |
| 2019 | 102,6  | +0,4%       |
| 2020 | 102,4  | −0,2%       |
| 2021 | 104,2  | +1,8%       |
| 2022 | 112,5  | +8,0%       |
| 2023 | 118,6  | +5,4%       |
| 2024 | 119,7  | +0,9%       |
| 2025 | 121,4  | +1,4%       |
| 2026 | 124,1  | provvisorio |

Come sono stati ricavati:

- Le variazioni medie annue sono quelle della tabella delle medie annue FOI di rivaluta.it,
  calcolate sugli indici pubblicati con un decimale. Partendo da 100 ciascun indice è l'unico
  valore con un decimale compatibile con la variazione pubblicata.
- Il 2025 coincide con il dato ufficiale: da gennaio 2026 il FOI ha base 2025 = 100 e ISTAT
  indica un coefficiente di raccordo con la base 2015 di **1,214**. La media dei dodici indici
  mensili 2025 (120,9 … 121,5) è 121,39.
- Il 2026 è la media dei mesi pubblicati (gennaio-agosto: 102,2 in base 2025), riportata in base
  2015 con il raccordo: 102,2 × 1,214 = 124,1. Va aggiornato ogni mese e sostituito dalla media
  annua a gennaio 2027.

Le variazioni che ISTAT comunica sugli indici non arrotondati (per esempio +8,1% per il 2022 nei
decreti di perequazione delle pensioni) possono differire di un decimale da quelle della tabella:
le rivalutazioni monetarie usano gli indici pubblicati, e così fa il calcolatore.

## Indici di dicembre, per il TFR

La rivalutazione del TFR usa l'aumento dell'indice da dicembre a dicembre:

| Dicembre           | 2020  | 2021  | 2022  | 2023  | 2024  | 2025  |
| ------------------ | ----- | ----- | ----- | ----- | ----- | ----- |
| Indice (base 2015) | 102,3 | 106,2 | 118,2 | 118,9 | 120,2 | 121,5 |

Verifica: nel 2022 l'indice passa da 106,2 a 118,2 (+11,3%), e 1,5% + 75% × 11,3% = 9,97%, il
coefficiente di rivalutazione del TFR 2022.

## Calcolo del potere d'acquisto

```
valore nell'anno B = importo nell'anno A × indice(B) / indice(A)
```

### Esempio: 30.000 € del 2020 in euro del 2026

30.000 × 124,1 / 102,4 = **36.357,42 €**, cioè un aumento del 21,2% per mantenere lo stesso potere
d'acquisto (test in `src/domain/inflation.test.ts`).

## Correzione di settembre 2026

La serie precedente era etichettata FOI ma le variazioni erano quasi tutte quelle dell'indice NIC,
con due valori (2016 e 2022) che non corrispondevano a nessuno dei due indici; il 2025 risultava
123,3 invece di 121,4. La scheda era archiviata mentre lo strumento era in uso.

## Fonti

- ISTAT, "Indice dei prezzi al consumo per le rivalutazioni monetarie" (base 2025 = 100 da gennaio
  2026, raccordo 1,214).
- Tabelle FOI senza tabacchi di rivaluta.it (medie annue e ultimi 24 mesi) e della Camera di
  Commercio di Modena (indici di dicembre).

## Ultima verifica

2026-09-28
