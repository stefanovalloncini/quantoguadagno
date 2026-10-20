# Regime ordinario: verifica dati

Regole e parametri del calcolatore per la partita IVA in regime ordinario: professionista, o ditta
individuale in contabilità semplificata. La detrazione per lavoro autonomo e impresa minore sta in
`src/data/params/irpef.ts` (`irpef.selfEmployedDeduction`) e si calcola in
`src/domain/selfEmployedDeduction.ts`; il resto del calcolo è in `src/domain/ordinario.ts`.
Contributi, scaglioni e addizionali sono quelli già verificati nelle schede `inps-autonomi.md`,
`irpef.md` e `regional-brackets.md`.

## Detrazione per lavoro autonomo e impresa minore

Art. 13, commi 5, 5-ter e 6 del TUIR (D.P.R. 917/1986), nel testo scritto dall'art. 1, comma 2,
lettera b), numeri 5 e 6 della L. 234/2021, in vigore dal 2022. Controllato su Normattiva il 20
ottobre 2026 nelle tre versioni dell'articolo che coprono gli anni supportati: in vigore dal 1°
gennaio 2022 al 30 dicembre 2023, dal 31 dicembre 2023 al 31 dicembre 2024, dal 1° gennaio 2025
al 31 dicembre 2026. Il testo dei commi 5, 5-ter e 6 è lo stesso in tutte e tre.

| Reddito complessivo          | Detrazione                              | Norma              |
| ---------------------------- | --------------------------------------- | ------------------ |
| fino a 5.500 €               | 1.265 €                                 | c. 5, lett. a)     |
| oltre 5.500 e fino a 28.000  | 500 + 765 × (28.000 − reddito) / 22.500 | c. 5, lett. b)     |
| oltre 28.000 e fino a 50.000 | 500 × (50.000 − reddito) / 22.000       | c. 5, lett. b-bis) |
| oltre 50.000 €               | nessuna                                 |                    |

Più 50 € se il reddito complessivo è superiore a 11.000 € e non supera 17.000 € (c. 5-ter).

- **Su quale reddito.** La norma usa il reddito complessivo: la somma dei redditi (art. 8 TUIR),
  prima degli oneri deducibili, che l'art. 10 c. 1 toglie "dal reddito complessivo". I contributi
  previdenziali obbligatori sono uno di questi oneri (art. 10 c. 1 lett. e)). L'IRPEF lorda invece
  si calcola "al reddito complessivo, al netto degli oneri deducibili" (art. 11 c. 1). Le istruzioni
  del modello Redditi PF (fascicolo 1, rigo RN7, colonne 3 e 4) e le specifiche tecniche (par.
  21.4) lo confermano: il reddito per le detrazioni è il rigo RN1 meno la deduzione per
  l'abitazione principale (RN2), senza togliere gli oneri deducibili del rigo RN3. Con la sola
  partita IVA il reddito complessivo è compensi o ricavi meno costi, prima dei contributi.
- **Quattro decimali.** Il comma 6: se il risultato dei rapporti è maggiore di zero, "lo stesso si
  assume nelle prime quattro cifre decimali". Le specifiche tecniche: "devono essere utilizzate le
  prime quattro cifre decimali". Il calcolatore tronca il quoziente alla quarta cifra, senza
  arrotondare.
- **I 50 € del comma 5-ter** valgono anche per il lavoro autonomo e per l'impresa minore: la
  circolare 4/E del 18 febbraio 2022 (par. 1.2.3) li elenca tra le novità del regime delle
  detrazioni "per i redditi di lavoro autonomo e altri redditi", e le specifiche tecniche li
  sommano nel calcolo del rigo RN7, colonna 4. Le istruzioni del fascicolo 1 hanno una frase che
  sembra limitarli ai redditi dell'art. 50: si è seguita la norma, la circolare e le specifiche.
- **Non cumulabile** con le detrazioni per lavoro dipendente e per pensione (c. 5). Il calcolatore
  assume che la partita IVA sia l'unico reddito dell'anno.
- **Non diventa un credito.** La detrazione non può superare l'imposta lorda: la parte in eccesso si
  perde.

### Esempi svolti

- Reddito 16.000 €: (28.000 − 16.000) / 22.500 = 0,53333… → 0,5333; 500 + 765 × 0,5333 = 907,97;
  più 50 € perché 16.000 è oltre 11.000 e fino a 17.000: **957,97 €**. Con il quoziente
  arrotondato invece che troncato sarebbero 958,00 €.
- Reddito 35.000 €: (50.000 − 35.000) / 22.000 = 0,681818… → 0,6818; 500 × 0,6818 = **340,90 €**.
- Reddito 40.000 €: (50.000 − 40.000) / 22.000 = 0,454545… → 0,4545; 500 × 0,4545 = **227,25 €**.
- Reddito 6.000 €: (28.000 − 6.000) / 22.500 = 0,97777… → 0,9777; 500 + 765 × 0,9777 =
  **1.247,94 €**.

## Il calcolo

`calculateOrdinario` in `src/domain/ordinario.ts`. Ogni riga si arrotonda al centesimo e il netto
si ottiene dalle righe già arrotondate, come nel calcolatore dello stipendio.

1. **Reddito** = compensi o ricavi meno costi, senza IVA. Per il professionista è il reddito di
   lavoro autonomo: somme percepite nell'anno meno spese sostenute nell'anno (art. 54 c. 1 TUIR).
   Per l'impresa in contabilità semplificata è il reddito d'impresa: ricavi percepiti meno spese
   sostenute (art. 66 c. 1 TUIR). Se i costi superano i ricavi il reddito è una perdita: niente
   IRPEF né addizionali, mentre il contributo minimo di artigiani e commercianti resta.
2. **Contributi** sul reddito, con le regole di `src/domain/inpsGestioni.ts`, le stesse del
   calcolatore del forfettario (scheda `inps-autonomi.md`): Gestione Separata al 26,07%, o al 24%
   per chi ha già un'altra copertura previdenziale, fino al massimale; artigiani e commercianti
   con il contributo minimo, riproporzionato ai mesi di attività, più l'aliquota sul reddito oltre
   il minimale e un punto in più oltre la prima fascia; cassa professionale con l'importo annuo
   inserito. Il contributo minimo dei commercianti 2026 è 18.808 × 24,48% + 7,44 = 4.611,64 €.
3. **Reddito imponibile** = reddito meno contributi, mai sotto zero: i contributi previdenziali
   obbligatori si deducono dal reddito complessivo (art. 10 c. 1 lett. e) TUIR).
4. **IRPEF lorda** con gli scaglioni dell'anno sul reddito imponibile (art. 11 c. 1 TUIR; scheda
   `irpef.md`).
5. **Detrazione** dell'art. 13 c. 5 sul reddito complessivo, cioè sul reddito del punto 1, fino a
   coprire l'IRPEF lorda.
6. **IRPEF netta** = IRPEF lorda meno la detrazione usata.
7. **Addizionali** regionale e comunale sul reddito imponibile, con le funzioni del calcolatore
   dello stipendio. Si pagano solo se c'è IRPEF netta: l'addizionale regionale "è dovuta se per lo
   stesso anno l'imposta sul reddito delle persone fisiche, al netto delle detrazioni [...], risulta
   dovuta" (art. 50 c. 2 D.Lgs. 446/1997); stessa regola per la comunale (art. 1 c. 4 D.Lgs.
   360/1998). Senza comune scelto si usa lo 0,80%, come negli altri calcolatori.
8. **Netto annuo** = reddito − contributi − IRPEF netta − addizionali. Il netto mensile è la media
   su 12 mesi.

Non ci sono il trattamento integrativo e il taglio del cuneo fiscale: il primo riguarda l'imposta
sui redditi degli articoli 49 e 50 del TUIR (art. 1 c. 1 D.L. 3/2020), il secondo i titolari di
reddito di lavoro dipendente (art. 1 c. 4 L. 207/2024).

### IRAP e IVA

- **IRAP.** "A decorrere dal periodo d'imposta in corso alla data di entrata in vigore della
  presente legge, l'imposta regionale sulle attività produttive (IRAP) [...] non è dovuta dalle
  persone fisiche esercenti attività commerciali ed esercenti arti e professioni" (art. 1 c. 8 L.
  234/2021, in vigore dal 1° gennaio 2022; circolare 4/E/2022, par. 3). Il calcolatore non la
  considera.
- **IVA.** Compensi, ricavi e costi si inseriscono senza IVA: l'IVA addebitata ai clienti si versa
  allo Stato (rivalsa, art. 18 D.P.R. 633/1972) e quella pagata sugli acquisti si detrae (art. 19),
  quindi non entra nel reddito.

### Saldo e acconti

Il calcolatore dà le imposte e i contributi di competenza dell'anno, non le date in cui si pagano.
La pagina lo spiega nell'approfondimento "Saldo e acconti: quando si paga", con questi fatti:

- saldo dell'anno prima e primo acconto entro il 30 giugno, o entro il 30 luglio con lo 0,40% in
  più; secondo acconto entro il 30 novembre (art. 17 c. 1 e 2 D.P.R. 435/2001; istruzioni Redditi
  PF 2026, fascicolo 1, par. 7);
- l'acconto IRPEF è pari all'imposta dell'anno prima tolte le ritenute subite (rigo RN34,
  "differenza") e non è dovuto se questa è inferiore a 52 €; si versa il 40% con la prima rata e
  il resto con la seconda, il 50% per i soggetti che applicano gli ISA (art. 17 c. 3 D.P.R.
  435/2001); chi prevede un'imposta più bassa può versare acconti più bassi (istruzioni Redditi
  PF 2026, rigo RN62);
- chi paga compensi di lavoro autonomo come sostituto d'imposta (aziende, altri professionisti)
  trattiene una ritenuta d'acconto del 20% (art. 25 c. 1 D.P.R. 600/1973; l'aliquota è passata
  dal 19% al 20% con l'art. 21 c. 11 L. 449/1997, riportato su Normattiva nelle note
  all'articolo): è IRPEF versata in anticipo, che nel rigo RN34 si toglie dall'imposta e quindi
  riduce saldo e acconti;
- quindi nel primo anno di attività, se nella dichiarazione dell'anno prima non c'era IRPEF da
  versare, non ci sono acconti; l'anno dopo, entro il 30 giugno, si versano il saldo di tutta
  l'imposta del primo anno e il primo acconto del secondo;
- l'addizionale comunale ha un acconto del 30% (art. 1 c. 4 D.Lgs. 360/1998); la regionale si
  versa in unica soluzione con il saldo (art. 50 c. 5 D.Lgs. 446/1997);
- i professionisti iscritti alla Gestione Separata versano i contributi alle scadenze delle
  imposte sui redditi, con saldo e due acconti (circolare INPS 8/2026, par. 4.2); artigiani e
  commercianti versano il contributo sul minimale in quattro rate (nel 2026: 18 maggio, 20
  agosto, 16 novembre e 16 febbraio 2027) e quello sul reddito oltre il minimale alle scadenze
  delle imposte, come saldo e acconti (circolare INPS 14/2026, par. 9).

I contributi si deducono nell'anno in cui si versano (art. 10 TUIR: "versati"). Il calcolatore
deduce i contributi dell'anno come se fossero versati nell'anno: con redditi stabili il risultato è
lo stesso, nel primo anno e quando il reddito cambia molto no.

## Confronto con il forfettario

`compareWithForfettario` usa il calcolo del forfettario (`src/domain/forfettario.ts`, scheda
`forfettario.md`) con gli stessi compensi o ricavi, la stessa gestione previdenziale e gli stessi
mesi di attività, il coefficiente dell'attività scelta e l'aliquota del 15%, o del 5% nei primi
cinque anni. Nel forfettario i costi veri non si deducono, ma si pagano lo stesso: per confrontare
due importi che si possono spendere, il netto del forfettario è ricavi − contributi − imposta
sostitutiva − gli stessi costi dell'ordinario.

- Oltre 85.000 € di ricavi il forfettario non si applica (art. 1 c. 54 L. 190/2014) e il confronto
  non si fa.
- Non si controllano gli altri requisiti del forfettario, come il tetto alle spese per il
  personale o il reddito da lavoro dipendente dell'anno prima.
- La riduzione del 35% dei contributi che artigiani e commercianti possono chiedere nel
  forfettario (art. 1 c. 77 L. 190/2014) non è applicata.
- Con la cassa professionale il contributo inserito vale per tutti e due i regimi.

## Vettori

Calcolati a mano dalle norme e ricontrollati con un calcolo indipendente in aritmetica decimale;
sono i casi di `tests/golden/ordinario.golden.test.ts`. Addizionale comunale 0,80% in tutti,
forfettario a regime (15%).

### 1. Professionista in Gestione Separata, 2026, Lombardia

Compensi 50.000 €, costi 10.000 €.

- Reddito: 50.000 − 10.000 = 40.000,00
- Contributi: 40.000 × 26,07% = 10.428,00
- Reddito imponibile: 40.000 − 10.428 = 29.572,00
- IRPEF lorda: 28.000 × 23% = 6.440,00; 1.572 × 33% = 518,76; totale 6.958,76
- Detrazione sul reddito di 40.000: 500 × 0,4545 = 227,25
- IRPEF netta: 6.958,76 − 227,25 = 6.731,51
- Addizionale regionale: 15.000 × 1,23% + 13.000 × 1,58% + 1.572 × 1,72% = 184,50 + 205,40 +
  27,04 = 416,94
- Addizionale comunale: 29.572 × 0,80% = 236,58
- Netto annuo: 40.000 − 10.428 − 6.731,51 − 416,94 − 236,58 = **22.186,97 €**, in media 1.848,91 €
  al mese
- Forfettario, attività professionali (78%): reddito 39.000,00; contributi 39.000 × 26,07% =
  10.167,30; imposta 15% su 28.832,70 = 4.324,91; netto 50.000 − 10.167,30 − 4.324,91 − 10.000 =
  **25.507,79 €**, cioè 3.320,82 € in più. Con il 5% l'imposta è 1.441,64 € e il netto 28.391,06 €.

### 2. Commerciante, 2026, Veneto

Ricavi 80.000 €, costi 45.000 €.

- Reddito: 35.000,00
- Contributi: minimo 4.611,64 + (35.000 − 18.808) × 24,48% = 4.611,64 + 3.963,80 = 8.575,44
- Reddito imponibile: 35.000 − 8.575,44 = 26.424,56
- IRPEF lorda: 26.424,56 × 23% = 6.077,65
- Detrazione sul reddito di 35.000: 500 × 0,6818 = 340,90
- IRPEF netta: 6.077,65 − 340,90 = 5.736,75
- Addizionale regionale: 26.424,56 × 1,23% = 325,02
- Addizionale comunale: 26.424,56 × 0,80% = 211,40
- Netto annuo: 35.000 − 8.575,44 − 5.736,75 − 325,02 − 211,40 = **20.151,39 €**
- Forfettario, commercio (40%): reddito 32.000,00; contributi 4.611,64 + 13.192 × 24,48% =
  7.841,04; imposta 15% su 24.158,96 = 3.623,84; netto 80.000 − 7.841,04 − 3.623,84 − 45.000 =
  **23.535,12 €**, cioè 3.383,73 € in più.

### 3. Professionista in Gestione Separata, 2025, Lombardia: i 50 € del comma 5-ter

Compensi 18.000 €, costi 2.000 €.

- Reddito: 16.000,00
- Contributi: 16.000 × 26,07% = 4.171,20
- Reddito imponibile: 16.000 − 4.171,20 = 11.828,80
- IRPEF lorda: 11.828,80 × 23% = 2.720,62
- Detrazione sul reddito di 16.000: 500 + 765 × 0,5333 + 50 = 957,97. Calcolata sul reddito
  imponibile sarebbe stata 1.099,81 €: è la scelta del punto 5 a fare la differenza.
- IRPEF netta: 2.720,62 − 957,97 = 1.762,65
- Addizionale regionale: 11.828,80 × 1,23% = 145,49
- Addizionale comunale: 11.828,80 × 0,80% = 94,63
- Netto annuo: 16.000 − 4.171,20 − 1.762,65 − 145,49 − 94,63 = **9.826,03 €**
- Forfettario (78%): reddito 14.040,00; contributi 3.660,23; imposta 15% su 10.379,77 =
  1.556,97; netto 18.000 − 3.660,23 − 1.556,97 − 2.000 = **10.782,80 €**, cioè 956,77 € in più.

### 4. Artigiano per sei mesi, 2024, Lombardia: la detrazione copre tutta l'imposta

Ricavi 20.000 €, costi 14.000 €, attività da luglio.

- Reddito: 6.000,00
- Contributi: minimo (18.415 × 24% + 7,44) × 6 / 12 = 4.427,04 / 2 = 2.213,52; niente oltre il
  minimale
- Reddito imponibile: 6.000 − 2.213,52 = 3.786,48
- IRPEF lorda: 3.786,48 × 23% = 870,89
- Detrazione sul reddito di 6.000: 1.247,94, se ne usano 870,89
- IRPEF netta: 0, e quindi niente addizionali
- Netto annuo: 6.000 − 2.213,52 = **3.786,48 €**
- Forfettario, altre attività (67%): reddito 13.400,00; contributi 2.213,52; imposta 15% su
  11.186,48 = 1.677,97; netto 20.000 − 2.213,52 − 1.677,97 − 14.000 = **2.108,51 €**: con costi
  così alti conviene l'ordinario, di 1.677,97 €.

## Limiti noti

- La partita IVA è l'unico reddito dell'anno. Con uno stipendio o una pensione i redditi si
  sommano, l'IRPEF sale e la detrazione dell'art. 13 c. 5 non si cumula con quella per lavoro
  dipendente o pensione.
- Le imprese sono in contabilità semplificata; in contabilità ordinaria la detrazione dell'art. 13
  c. 5 non spetta.
- Non sono gestiti: le perdite degli anni precedenti, gli oneri deducibili e detraibili diversi
  dai contributi, le riduzioni dei contributi di artigiani e commercianti, il massimale ridotto
  per chi ha contributi prima del 1996, i minimi delle casse professionali.

## Fonti

- D.P.R. 22 dicembre 1986, n. 917 (TUIR), art. 13 c. 5, 5-ter e 6, su Normattiva:
  https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.del.presidente.della.repubblica:1986-12-22;917~art13
  (versioni lette aggiungendo `!vig=2022-06-30`, `!vig=2024-06-30` e `!vig=2026-10-20`).
- TUIR, art. 8 (reddito complessivo), art. 10 c. 1 lett. e) (contributi tra gli oneri deducibili),
  art. 11 c. 1 (imposta lorda sul reddito al netto degli oneri deducibili), art. 54 c. 1 (reddito
  di lavoro autonomo) e art. 66 c. 1 (imprese minori), su Normattiva.
- D.P.R. 29 settembre 1973, n. 600, art. 25 c. 1 (ritenuta d'acconto sui compensi di lavoro
  autonomo), su Normattiva con le note di aggiornamento (art. 21 c. 11 L. 27 dicembre 1997, n.
  449, che porta l'aliquota al 20%):
  https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.del.presidente.della.repubblica:1973-09-29;600~art25
- D.Lgs. 15 dicembre 1997, n. 446, art. 50 c. 2 e 5 (addizionale regionale):
  https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:1997-12-15;446~art50
- D.Lgs. 28 settembre 1998, n. 360, art. 1 c. 4 (addizionale comunale):
  https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:1998-09-28;360~art1
- D.L. 5 febbraio 2020, n. 3, art. 1 c. 1 (trattamento integrativo) e L. 30 dicembre 2024, n.
  207, art. 1 c. 4 (taglio del cuneo), su Normattiva.
- D.P.R. 26 ottobre 1972, n. 633, art. 18 e 19 (rivalsa e detrazione dell'IVA).
- L. 23 dicembre 2014, n. 190, art. 1 c. 54 e 77 (limite di ricavi del forfettario e riduzione dei
  contributi), già nella scheda `forfettario.md`.
- INPS, circolare n. 8 del 3 febbraio 2026, par. 4.2 (versamenti dei professionisti in Gestione
  Separata):
  https://www.inps.it/content/dam/inps-site/it/scorporati/circolari-e-messaggi/2026/02/Circolare_15153/Allegati/16573_Circolare-numero-8-del-03-02-2026.pdf
- INPS, circolare n. 14 del 9 febbraio 2026, par. 9 (versamenti di artigiani e commercianti):
  https://www.inps.it/content/dam/inps-site/it/scorporati/circolari-e-messaggi/2026/02/Circolare_15162/Allegati/16561_Circolare-numero-14-del-09-02-2026.pdf
- L. 30 dicembre 2021, n. 234, art. 1 c. 2 lett. b) n. 5 e 6 (G.U. n. 310 del 31 dicembre 2021,
  S.O. n. 49): https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:2021-12-30;234
- Agenzia delle Entrate, circolare n. 4/E del 18 febbraio 2022, par. 1.2.3:
  https://www.agenziaentrate.gov.it/portale/documents/20143/4169770/Circolare+n.+4+del+18+febbraio+2022.pdf/a83fd984-2bc3-39a9-1e09-79e9a870d401
- Agenzia delle Entrate, istruzioni Redditi PF 2026, fascicolo 1: par. 7 (termini di versamento),
  righi da RN1 a RN7 e rigo RN62 (acconti); le istruzioni Redditi PF 2025 hanno lo stesso testo:
  https://www.agenziaentrate.gov.it/portale/documents/d/guest/pf1_istruzioni_2026_agg-28-05-2026
- Agenzia delle Entrate, specifiche tecniche Redditi PF 2026, par. 21.4:
  https://www.agenziaentrate.gov.it/portale/documents/d/guest/specifiche_tecniche_redditi_pf_2026_agg-13-04-2026

## Ultima verifica

2026-10-20
