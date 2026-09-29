# Regime forfettario — verifica dati

## Soglia ricavi e tetto spese dipendenti

| Voce                                       | Valore         | Norma                                                                                                |
| ------------------------------------------ | -------------- | ---------------------------------------------------------------------------------------------------- |
| Soglia ricavi/compensi                     | 85.000 €       | Art. 1 c. 54 lett. a) L. 190/2014, modificato dall'Art. 1 c. 54 lett. a) L. 197/2022 (Bilancio 2023) |
| Tetto spese per dipendenti e collaboratori | 20.000 € lordi | Art. 1 c. 54 lett. b) L. 190/2014, modificato dalla L. 145/2018                                      |

In vigore dal periodo d'imposta 2023 (soglia precedente 65.000 €). La fuoriuscita dal regime è immediata se durante l'anno i ricavi superano 100.000 € (Art. 1 c. 71 L. 190/2014); il calcolatore si limita alla soglia annua di 85.000 € e mostra un avviso quando il valore inserito raggiunge l'80%.

## Aliquota sostitutiva

| Fase                                                      | Aliquota | Norma                    |
| --------------------------------------------------------- | -------- | ------------------------ |
| Primi 5 periodi d'imposta dall'apertura della partita IVA | 5%       | Art. 1 c. 65 L. 190/2014 |
| A regime (dal 6° anno in poi)                             | 15%      | Art. 1 c. 64 L. 190/2014 |

L'aliquota del 5% nei primi 5 anni richiede ulteriori requisiti (assenza di esercizio nei 3 anni precedenti, attività non prosecuzione di lavoro dipendente, ecc.). Il calcolatore applica l'aliquota in base ai soli anni di attività dichiarati, lasciando all'utente la verifica degli altri requisiti.

## Coefficienti di redditività

Allegato 4 alla L. 190/2014. Invariati dalla riforma del 2015.

| Categoria                                                                | Codice ATECO (raggruppato) | Coefficiente |
| ------------------------------------------------------------------------ | -------------------------- | ------------ |
| Industrie alimentari e bevande                                           | 10-11                      | 40%          |
| Commercio all'ingrosso e al dettaglio                                    | 45-47 (esclusi ambulanti)  | 40%          |
| Commercio ambulante di alimentari e bevande                              | 47.81                      | 40%          |
| Commercio ambulante di altri prodotti                                    | 47.82, 47.89               | 54%          |
| Costruzioni e attività immobiliari                                       | 41-43, 68                  | 86%          |
| Intermediari del commercio                                               | 46.1                       | 62%          |
| Servizi di alloggio e ristorazione                                       | 55, 56                     | 40%          |
| Attività professionali, scientifiche, tecniche, sanitarie, di istruzione | 64-66, 69-75, 85, 86-88    | 78%          |
| Altre attività economiche                                                | tutti gli altri            | 67%          |

## Contributi INPS — Gestione Separata

Iscritti senza altra copertura previdenziale obbligatoria.

| Anno | Aliquota piena | Aliquota ridotta (altra copertura / pensionati) | Massimale | Minimale reddituale |
| ---- | -------------- | ----------------------------------------------- | --------- | ------------------- |
| 2024 | 26,07%         | 24%                                             | 119.650 € | 18.415 €            |
| 2025 | 26,07%         | 24%                                             | 120.607 € | 18.555 €            |
| 2026 | 26,07%         | 24%                                             | 122.295 € | 18.815 €            |

L'aliquota 26,07% è composta da 24% IVS + 0,72% maternità/malattia/ANF/DIS-COLL + 1,35% DIS-COLL aggiuntiva per professionisti senza cassa (totale invariato dal 2024 al 2026). L'aliquota ridotta 24% si applica agli iscritti che dispongono di un'altra forma pensionistica obbligatoria o sono pensionati.

Massimale e minimale 2026: rivalutazione ISTAT +1,40% applicata sulla base 2025 (Decreto MEF 19/11/2025).

## Calcolo applicato

Reddito imponibile lordo = fatturato × coefficiente di redditività  
Contributi INPS dovuti = imponibile lordo × aliquota Gestione Separata (capped al massimale)  
Imponibile sostitutiva = imponibile lordo − contributi INPS dovuti  
Imposta sostitutiva = imponibile sostitutiva × (5% o 15%)  
Reddito netto annuo = fatturato − contributi INPS − imposta sostitutiva

I contributi INPS sono interamente deducibili dal reddito imponibile (Art. 1 c. 64 L. 190/2014).

## Esempi di calcolo (golden vectors 2025)

### Professionista, primi 5 anni, fatturato 30.000 €

- Imponibile lordo: 30.000 × 78% = 23.400,00 €
- INPS GS: 23.400 × 26,07% = 6.100,38 €
- Imponibile sostitutiva: 23.400 − 6.100,38 = 17.299,62 €
- Sostitutiva 5%: 17.299,62 × 5% = 864,98 €
- Netto annuo: 30.000 − 6.100,38 − 864,98 = **23.034,64 €**
- Netto mensile: **1.919,55 €**

### Professionista a regime, fatturato 60.000 €

- Imponibile lordo: 60.000 × 78% = 46.800,00 €
- INPS GS: 46.800 × 26,07% = 12.200,76 €
- Imponibile sostitutiva: 46.800 − 12.200,76 = 34.599,24 €
- Sostitutiva 15%: 34.599,24 × 15% = 5.189,89 €
- Netto annuo: 60.000 − 12.200,76 − 5.189,89 = **42.609,35 €**

### Commercio al limite del regime, fatturato 85.000 €

- Imponibile lordo: 85.000 × 40% = 34.000,00 €
- INPS GS: 34.000 × 26,07% = 8.863,80 €
- Imponibile sostitutiva: 34.000 − 8.863,80 = 25.136,20 €
- Sostitutiva 15%: 25.136,20 × 15% = 3.770,43 €
- Netto annuo: 85.000 − 8.863,80 − 3.770,43 = **72.365,77 €**

## Limitazioni note

- Il calcolatore copre solo l'iscrizione alla Gestione Separata INPS, che è la cassa di riferimento per i professionisti senza ordine. Artigiani, commercianti e iscritti a casse professionali (Inarcassa, Cassa Forense, ENPAM, ecc.) usano regole contributive diverse e non sono coperti in questa versione.
- Non è gestita la riduzione del 35% sui contributi IVS prevista dall'Art. 1 c. 77 L. 190/2014 per artigiani e commercianti in forfettario (non applicabile alla Gestione Separata).
- Non sono calcolati gli acconti d'imposta (40% / 60% sull'imposta dell'anno precedente).
- Non è verificata l'eleggibilità rispetto a redditi da lavoro dipendente concorrenti, partecipazioni in società, ecc.: l'utente conferma di rientrare nel regime.

## Fonti

- L. 190/2014 (Legge di Stabilità 2015), Art. 1 commi 54-89 — disciplina originaria.
- L. 197/2022 (Bilancio 2023), Art. 1 c. 54 — innalzamento soglia ricavi a 85.000 €.
- Allegato 4 alla L. 190/2014 — tabella coefficienti per categoria ATECO.
- Circolare INPS n. 8 del 30/01/2024 — aliquote Gestione Separata 2024.
- Circolare INPS n. 27 del 06/02/2025 — aliquote Gestione Separata 2025.
- Circolare INPS n. 8 del 30/01/2026 — aliquote Gestione Separata 2026, massimale e minimale.
- Decreto MEF 19/11/2025 — perequazione automatica +1,40% per il 2026.
- Agenzia delle Entrate, Circolari su regime forfettario disponibili su https://www.agenziaentrate.gov.it

## Ultima verifica

2026-05-15
