# Fringe benefit — verifica dati

Riferimento normativo: Art. 51 TUIR (D.P.R. 917/1986) per la base imponibile dei
compensi in natura; soglie di esenzione modificate anno per anno dalle leggi di
bilancio.

## Soglie di esenzione welfare (Art. 51 c. 3 TUIR)

| Anno | Generale | Con figli a carico | Norma                                           |
| ---- | -------- | ------------------ | ----------------------------------------------- |
| 2024 | 1.000 €  | 2.000 €            | L. 213/2023 (Bilancio 2024), art. 1 c. 16       |
| 2025 | 1.000 €  | 2.000 €            | L. 207/2024 (Bilancio 2025), triennio 2025–2027 |
| 2026 | 1.000 €  | 2.000 €            | L. 207/2024, confermato per il triennio         |

La soglia ordinaria a regime sarebbe 258,23 €; le leggi di bilancio l'hanno
elevata. Il limite con figli si applica ai dipendenti con figli fiscalmente a
carico (reddito ≤ 2.840,51 €, ovvero ≤ 4.000 € fino a 24 anni). Superata la
soglia, l'intero importo concorre a tassazione, non solo l'eccedenza.

## Buoni pasto (Art. 51 c. 2 lett. c TUIR)

| Anno | Elettronici | Cartacei   | Norma                              |
| ---- | ----------- | ---------- | ---------------------------------- |
| 2024 | 8 €/giorno  | 4 €/giorno | L. 160/2019, in vigore dal 2020    |
| 2025 | 8 €/giorno  | 4 €/giorno | invariato                          |
| 2026 | 10 €/giorno | 4 €/giorno | L. di Bilancio 2026, dall'1/1/2026 |

Il calcolatore distingue buoni elettronici e cartacei. L'eccedenza giornaliera
oltre la soglia è imponibile, moltiplicata per i giorni lavorativi dell'anno.

## Assistenza sanitaria (Art. 51 c. 2 lett. a TUIR)

Contributi a casse/fondi sanitari esenti fino a **3.615,20 €/anno**, invariato in
tutti gli anni gestiti.

## Auto in uso promiscuo (Art. 51 c. 4 lett. a TUIR)

Per i contratti stipulati dall'1/1/2025 (L. 207/2024, art. 1 c. 48) la percentuale
imponibile dipende dall'alimentazione: BEV 10%, ibrido plug-in 20%, altri 50%,
applicata al costo convenzionale ACI su 15.000 km/anno.

Per i contratti precedenti vale la tabella a emissioni CO2: ≤60 g/km 25%,
61–160 g/km 30%, 161–190 g/km 50%, oltre 190 g/km 60%.

## Esempi di calcolo (golden vectors)

### Welfare 2025, importo 1.500 €, senza figli

- Soglia 1.000 €, superata: imponibile l'intero valore = **1.500 €**.

### Welfare 2026, importo 1.200 €, senza figli (caso completo)

- Imponibile welfare 1.200 €, che entra nella base INPS e IRPEF insieme alla RAL.
- Con una RAL di 30.000 €, Lombardia, comunale 0,8%, 13 mensilità: netto annuo **22.906,75 €**
  (caso in `tests/golden/employee.golden.test.ts`).

Fino a settembre 2026 il calcolatore tassava solo l'eccedenza sulla soglia, contro la regola
scritta sopra.

### Welfare 2025, importo 1.500 €, con figli a carico

- Soglia 2.000 €, nessun imponibile = **0 €**.

### Buoni pasto 2026, 10 €/giorno × 22 giorni × 12 mesi

- Valore annuo 2.640 €, soglia 2.640 €, imponibile = **0 €**.

### Auto BEV 2025, costo ACI 0,40 €/km

- Costo convenzionale 0,40 × 15.000 = 6.000 €, imponibile 10% = **600 €**.

## Ultima verifica

2026-09-28
