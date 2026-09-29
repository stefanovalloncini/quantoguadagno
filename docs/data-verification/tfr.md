# TFR accumulato — verifica dati

Riferimento normativo: Art. 2120 c.c. (disciplina del trattamento di fine
rapporto) e DL 47/2014 art. 1 (imposta sostitutiva sulla rivalutazione elevata
dall'11% al 17%).

## Formula

Ogni anno:

```
quota annua      = RAL / 13,5 − 0,50% × RAL
rivalutazione    = stock al 31/12 dell'anno precedente × (1,5% + 75% × inflazione FOI)
imposta          = 17% sulla rivalutazione
stock            = stock precedente + quota + rivalutazione netta
```

- Lo 0,50% è il contributo aggiuntivo IVS dell'art. 3 c. 15 L. 297/1982, che il datore versa
  all'INPS e recupera sulla quota annua di TFR (art. 3 c. 16). La quota che matura per il
  lavoratore è quindi circa il 6,91% della RAL, non il 7,41%.
- Nel costo del datore il TFR entra per la stessa quota ridotta, perché lo 0,50% è già compreso
  nell'aliquota IVS a suo carico (23,81%): la L. 297/1982 lo introdusse come aumento
  dell'aliquota del Fondo pensioni lavoratori dipendenti, oggi confluita nel 33% complessivo.
  Da confermare su una circolare INPS che lo scriva in chiaro.
- Per la rivalutazione conta l'aumento dell'indice FOI da dicembre a dicembre (vedi
  `inflazione.md`), non la media annua.

- La quota dell'anno in corso **non** viene rivalutata nello stesso anno: la
  rivalutazione si applica al montante accantonato al 31 dicembre dell'anno
  precedente.
- Il coefficiente di rivalutazione è 1,5% fisso + 75% dell'aumento dell'indice
  ISTAT FOI. Per una proiezione si usa un'inflazione attesa.
- Lo "stock" è il TFR accumulato **al lordo della tassazione separata** che si
  applica solo alla liquidazione (TUIR art. 19, aliquota media); questo
  strumento non la calcola.

## Esempi di calcolo (golden vectors)

### RAL 30.000 €, 3 anni, inflazione attesa 2%

- Quota annua = 30.000 / 13,5 − 150 = **2.072,22 €**
- Coefficiente di rivalutazione = 1,5% + 75% × 2% = **3%**
- Anno 1: stock 0 → nessuna rivalutazione → stock 2.072,22 €
- Anno 2: rivalutazione 2.072,22 × 3% = 62,17 €, netta 51,60 € → stock 4.196,04 €
- Anno 3: rivalutazione 4.196,04 × 3% = 125,88 €, netta 104,48 € → stock 6.372,75 €
- Totale quote = **6.216,67 €**, imposta sostitutiva totale ≈ **31,97 €**.

## Semplificazioni

- RAL costante per tutto il periodo (le carriere reali crescono).
- Inflazione attesa costante (l'indice FOI reale varia anno per anno).
- Non include la tassazione separata alla liquidazione né eventuali anticipazioni.

## Ultima verifica

2026-09-28
