# Tredicesima netta — verifica dati

## Base normativa

La tredicesima, la quattordicesima e le altre mensilità aggiuntive sono reddito di lavoro dipendente
(art. 51 TUIR): pagano contributi INPS e IRPEF come lo stipendio. Cambia il modo in cui il datore di
lavoro trattiene l'IRPEF quando le paga.

Art. 23, comma 2, lettera b), DPR 29 settembre 1973, n. 600, testo in vigore dal 21 maggio 2022 al
31 dicembre 2026, letto su Normattiva il 20 ottobre 2026
(https://www.normattiva.it/uri-res/N2Ls?urn:nir:presidente.repubblica:decreto:1973-09-29;600~art23!vig=2026-10-20).
La ritenuta da operare è determinata:

> b) sulle mensilità aggiuntive e sui compensi della stessa natura, con le aliquote dell'imposta sul
> reddito delle persone fisiche, ragguagliando a mese i corrispondenti scaglioni annui di reddito;

Per le mensilità ordinarie la lettera a) dello stesso comma ragguaglia gli scaglioni "al periodo di
paga" ed effettua "le detrazioni previste negli articoli 12 e 13 del citato testo unico, rapportate
al periodo stesso". La lettera b) non prevede detrazioni: sulla mensilità aggiuntiva non si tolgono
la detrazione per lavoro dipendente, quelle per familiari a carico e la detrazione aggiuntiva del
taglio del cuneo fiscale, che restano nelle mensilità ordinarie.

Dal 1° gennaio 2027 l'art. 23 è abrogato dal D.Lgs. 24 marzo 2025, n. 33 (testo unico versamenti e
riscossione), come modificato dal D.L. 31 dicembre 2025, n. 200. Chi aggiunge il 2027 deve ritrovare
la regola nel testo unico e citarne l'articolo.

## Le voci della mensilità aggiuntiva

- **Lordo**: una mensilità, cioè la RAL divisa per il numero di mensilità.
- **INPS**: la stessa aliquota del mese ordinario (9,19% a carico del dipendente nel caso standard).
  Lo sconto contributivo del 2024 era riconosciuto "senza effetti sul rateo di tredicesima"
  (art. 1, comma 15, L. 213/2023), e la Circolare INPS n. 11 del 16 gennaio 2024 lo esclude anche
  dalla quattordicesima: la mensilità aggiuntiva paga i contributi pieni anche nel 2024.
- **IRPEF**: l'imposta a scaglioni sull'imponibile della sola mensilità aggiuntiva, con ogni limite
  annuo diviso per 12. Nel 2026: 23% fino a 2.333,33 €, 33% fino a 4.166,67 €, 43% oltre. Nel 2024
  e nel 2025 lo scaglione intermedio era al 35%.
- **Addizionali regionale e comunale**: non si trattengono. Il datore di lavoro le determina al
  conguaglio e le trattiene a rate nelle buste paga dell'anno dopo: al massimo undici rate "a partire
  dal periodo di paga successivo a quello in cui le stesse sono effettuate e non oltre quello
  relativamente al quale le ritenute sono versate nel mese di dicembre" (art. 50, comma 4,
  D.Lgs. 446/1997 per la regionale; art. 1, comma 5, D.Lgs. 360/1998 per la comunale, il cui acconto
  si trattiene in nove rate da marzo).

Con 14 mensilità la tredicesima e la quattordicesima si pagano in mesi diversi e ognuna si tassa da
sola con gli stessi scaglioni mensili.

## Formula

```
lordo        = RAL / mensilità
INPS         = lordo × aliquota INPS
imponibile   = lordo − INPS
IRPEF        = imposta a scaglioni sull'imponibile, con ogni limite annuo diviso per 12
netto        = lordo − INPS − IRPEF
```

Ogni voce si arrotonda al centesimo; l'IRPEF si arrotonda sul totale, non scaglione per scaglione.
Il calcolo è in `src/domain/tredicesima.ts`, i casi qui sotto in `src/domain/tredicesima.test.ts`.

## Il conguaglio di fine anno

La ritenuta sulla mensilità aggiuntiva è un acconto. Entro il 28 febbraio dell'anno dopo, o alla fine
del rapporto, il datore di lavoro fa "il conguaglio tra le ritenute operate sulle somme e i valori di
cui alle lettere a) e b) del comma 2, e l'imposta dovuta sull'ammontare complessivo degli emolumenti
stessi, tenendo conto delle detrazioni" (art. 23, comma 3): ricalcola l'IRPEF sul reddito dell'intero
anno e trattiene o restituisce la differenza, di solito nella busta paga di dicembre o in quelle di
inizio anno. Per questo il netto annuo dello stipendio non cambia, mentre il netto della tredicesima
che calcoliamo è quello che arriva con la tredicesima, con le ritenute del suo mese.

## Esempi di calcolo (golden vectors)

### RAL 30.000 €, 13 mensilità, 2026

- Lordo = 30.000 / 13 = 2.307,69 €
- INPS = 2.307,69 × 9,19% = 212,08 €
- Imponibile = 2.095,61 €, sotto il primo limite mensile (28.000 / 12 = 2.333,33 €)
- IRPEF = 2.095,61 × 23% = 481,99 €
- Netto = **1.613,62 €**

Uguale nel 2024 e nel 2025: il primo scaglione non è cambiato.

### RAL 60.000 €, 13 mensilità, 2026

- Lordo = 60.000 / 13 = 4.615,38 €
- INPS = 4.615,38 × 9,19% = 424,15 €
- Imponibile = 4.191,23 €
- IRPEF = 2.333,333 × 23% + (4.166,667 − 2.333,333) × 33% + (4.191,23 − 4.166,667) × 43%
  = 536,667 + 605,000 + 10,562 = 1.152,229 → 1.152,23 €
- Netto = **3.039,00 €**

Con gli scaglioni del 2025 (35% nel secondo): 536,667 + 641,667 + 10,562 = 1.188,896 → 1.188,90 €,
netto **3.002,33 €**.

### RAL 45.000 €, 14 mensilità, 2026

- Lordo = 45.000 / 14 = 3.214,29 €
- INPS = 3.214,29 × 9,19% = 295,39 €
- Imponibile = 2.918,90 €
- IRPEF = 536,667 + (2.918,90 − 2.333,333) × 33% = 536,667 + 193,237 = 729,904 → 729,90 €
- Netto = **2.189,00 €** per la tredicesima e altrettanti per la quattordicesima, 4.378,00 € in tutto

### RAL 40.000 €, 13 mensilità, 2025 e 2026

- Lordo = 3.076,92 €, INPS = 282,77 €, imponibile = 2.794,15 €
- 2025: IRPEF = 536,667 + (2.794,15 − 2.333,333) × 35% = 536,667 + 161,286 = 697,953 → 697,95 €,
  netto **2.096,20 €**
- 2026: IRPEF = 536,667 + 460,817 × 33% = 536,667 + 152,070 = 688,736 → 688,74 €, netto
  **2.105,41 €**
- Il secondo scaglione al 33% lascia sulla tredicesima 9,21 € in più.

## Correzione di ottobre 2026

Fino a questa verifica il calcolatore tassava tutto l'imponibile della mensilità aggiuntiva
all'aliquota marginale del reddito annuo. L'IRPEF risultava troppo alta ogni volta che il reddito
imponibile dell'anno superava 28.000 €: con una RAL di 60.000 € su 13 mensilità nel 2026
calcolavamo 4.191,23 × 43% = 1.802,23 € invece di 1.152,23 €, e il netto mostrato era 2.389,00 €
invece di 3.039,00 € (650,00 € in meno). Con 40.000 € la differenza era di 233,33 €.

## Fonti

- Art. 23, commi 2 e 3, DPR 600/1973, Normattiva, testo vigente al 20 ottobre 2026:
  https://www.normattiva.it/uri-res/N2Ls?urn:nir:presidente.repubblica:decreto:1973-09-29;600~art23!vig=2026-10-20
- Art. 50, comma 4, D.Lgs. 446/1997, Normattiva:
  https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:1997-12-15;446~art50!vig=2026-10-20
- Art. 1, comma 5, D.Lgs. 360/1998, Normattiva:
  https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:1998-09-28;360~art1!vig=2026-10-20
- Art. 1, comma 15, L. 213/2023, Normattiva:
  https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:2023-12-30;213~art1-com15!vig=2024-06-30
- Circolare INPS n. 11 del 16 gennaio 2024:
  https://www.inps.it/it/it/inps-comunica/atti/circolari-messaggi-e-normativa/dettaglio.circolari-e-messaggi.2024.01.circolare-numero-11-del-16-01-2024_14436.html
- Art. 51 TUIR (DPR 917/1986).

## Ultima verifica

2026-10-20
