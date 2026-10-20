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

- **Somma del taglio del cuneo fiscale** (dal 2025, con un reddito fino a 20.000 €): la legge la
  determina "applicando al reddito di lavoro dipendente del contribuente la percentuale
  corrispondente" (art. 1, comma 4, L. 207/2024), cioè il 7,1%, il 5,3% o il 4,8% secondo il reddito
  dell'anno. A differenza della detrazione aggiuntiva del comma 6 non è "rapportata al periodo di
  lavoro", e la Circolare dell'Agenzia delle Entrate n. 4/E del 16 maggio 2025 precisa che il
  sostituto d'imposta "riconosce la somma spettante applicando tale percentuale al reddito
  effettivamente corrisposto mensilmente" (frase ripresa nella Risposta n. 7/2026). La mensilità
  aggiuntiva è reddito corrisposto nel suo mese: la somma si aggiunge anche lì.

Con 14 mensilità la tredicesima e la quattordicesima si pagano in mesi diversi e ognuna si tassa da
sola con gli stessi scaglioni mensili.

## Formula

```
lordo        = RAL / mensilità
INPS         = lordo × aliquota INPS
imponibile   = lordo − INPS
IRPEF        = imposta a scaglioni sull'imponibile, con ogni limite annuo diviso per 12
somma        = imponibile × percentuale del taglio del cuneo (0 nel 2024 e oltre 20.000 €)
netto        = lordo − INPS − IRPEF + somma
```

La percentuale della somma si sceglie sul reddito imponibile dell'anno: nel calcolatore della
tredicesima è la RAL meno i contributi al 9,19%, nello stipendio netto è il reddito imponibile del
calcolo dell'anno.

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

### RAL 15.000 €, 13 mensilità, 2026

- Lordo = 15.000 / 13 = 1.153,85 €
- INPS = 1.153,85 × 9,19% = 106,04 €
- Imponibile = 1.047,81 €
- IRPEF = 1.047,81 × 23% = 241,00 €
- Reddito imponibile dell'anno = 15.000 − 1.378,50 = 13.621,50 €, tra 8.500 e 15.000 €: somma al 5,3%
- Somma = 1.047,81 × 5,3% = 55,53 €
- Netto = 1.153,85 − 106,04 − 241,00 + 55,53 = **862,34 €**

Nel 2024 la somma non c'era: netto 806,81 €.

## Mese normale e mensilità aggiuntive nello stipendio netto

Lo stipendio netto mostra la media dell'anno su tutte le mensilità. Con più di 12 mensilità la
divide in mese normale e mensilità aggiuntiva (`splitSalaryYear` in `src/domain/tredicesima.ts`):

```
mensilità aggiuntiva = netto con la formula qui sopra, sul lordo dell'anno
mese normale         = (netto annuo − mensilità aggiuntive × il loro netto) / 12
```

Per la mensilità aggiuntiva il calcolo usa:

- l'aliquota INPS che il calcolo dell'anno ha applicato davvero, prima dello sconto del 2024:
  contributi più sconto, diviso il lordo. Comprende apprendistato, settore pubblico, aziende con più
  di 15 dipendenti, l'1% oltre la prima fascia di retribuzione e il massimale. Sopra la prima fascia
  (56.224 € nel 2026) è più alta del 9,19% del calcolatore della tredicesima: con 60.000 € la
  tredicesima dello stipendio netto è 3.037,34 €, quella del calcolatore della tredicesima 3.039,00 €;
- gli scaglioni IRPEF dell'anno, divisi per 12;
- la percentuale della somma del cuneo scelta sul reddito imponibile del calcolo dell'anno.

Il mese normale è la media delle dodici buste paga ordinarie dopo il conguaglio: contiene le
detrazioni, le addizionali, il trattamento integrativo e la differenza che il conguaglio trattiene o
restituisce. Con redditi alti le ritenute dei mesi restano sotto l'imposta dell'anno (con 60.000 €
circa 650 € in tutto) e il conguaglio trattiene la differenza: le buste paga ordinarie prima del
conguaglio sono più alte del mese normale, circa 54 € al mese. Quando l'IRPEF dell'anno è zero, il
conguaglio restituisce quella trattenuta sulla tredicesima, e il mese normale la comprende.

### Esempi (Lombardia, addizionale comunale 0,80%)

| Anno | RAL      | Mensilità | Netto annuo | Media      | Mese normale | Mensilità aggiuntiva |
| ---- | -------- | --------- | ----------- | ---------- | ------------ | -------------------- |
| 2026 | 30.000 € | 13        | 23.425,52 € | 1.801,96 € | 1.817,66 €   | 1.613,62 €           |
| 2024 | 30.000 € | 13        | 23.407,72 € | 1.800,59 € | 1.816,18 €   | 1.613,62 €           |
| 2026 | 60.000 € | 13        | 37.554,66 € | 2.888,82 € | 2.876,44 €   | 3.037,34 €           |
| 2026 | 15.000 € | 13        | 14.088,98 € | 1.083,77 € | 1.102,22 €   | 862,34 €             |
| 2026 | 35.000 € | 14        | 26.032,21 € | 1.859,44 € | 1.878,00 €   | 1.748,09 € ciascuna  |
| 2026 | 30.000 € | 15        | 23.425,52 € | 1.561,70 € | 1.602,51 €   | 1.398,47 € ciascuna  |

Nel 2024 la tredicesima paga i contributi pieni (9,19%) mentre i mesi normali hanno lo sconto. Con
60.000 € la tredicesima netta supera il mese normale: non paga addizionali, sopra 50.000 € non perde
detrazioni, e il conguaglio pesa sui mesi normali.

### Quando la divisione non si mostra

La mensilità aggiuntiva segue la regola qui sopra solo se nell'anno non c'è niente che si paga, si
tassa o si esonera con un calendario suo. Se il calcolo ha una di queste voci, lo stipendio netto
mostra solo la media:

- premio di risultato: arriva una volta l'anno, con la sua imposta sostitutiva;
- benefit tassati (auto aziendale, buoni pasto o welfare oltre le soglie): entrano nel reddito dei
  mesi in cui li ricevi, e il calcolo non sa quali;
- regime impatriati: l'esenzione vale anche sulla tredicesima, che la regola qui sopra tasserebbe
  per intero;
- esonero contributivo delle madri lavoratrici: ha un tetto annuo e non sappiamo come si distribuisce
  tra i mesi;
- previdenza complementare: il contributo riduce l'imponibile dei mesi in cui lo versi.

Familiari a carico e spese detraibili non cambiano la mensilità aggiuntiva, perché sono detrazioni:
restano nel mese normale. I benefit che restano sotto le soglie di esenzione non cambiano niente.

## Da verificare

La Circolare 4/E/2025 e la Risposta 7/2026 non nominano la tredicesima: dicono che la percentuale si
applica al reddito corrisposto ogni mese. Il calcolatore la applica anche alla mensilità aggiuntiva.
Se una fonte ufficiale dicesse il contrario, quella parte della somma arriverebbe con il conguaglio:
il netto dell'anno non cambierebbe, cambierebbe solo il mese in cui la ricevi.

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
- Art. 1, commi 4-6, L. 207/2024, Normattiva:
  https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:2024-12-30;207~art1-com4!vig=2026-10-20
- Agenzia delle Entrate, Circolare n. 4/E del 16 maggio 2025, paragrafo sugli adempimenti dei
  sostituti d'imposta:
  https://www.agenziaentrate.gov.it/portale/documents/20143/8410823/Circolare+lavoro+dipendente+LB2025+DD+IRPEF+n.+4+del+16+maggio+2025.pdf/36979eaa-9fc5-a4ec-a7aa-136497c53f91
- Agenzia delle Entrate, Risposta n. 7/2026:
  https://www.agenziaentrate.gov.it/portale/documents/20143/9570465/Risposta+n.+7_2026/6039a428-3237-b76b-9661-7549b9e798ec
- Art. 51 TUIR (DPR 917/1986).

## Ultima verifica

2026-10-20
