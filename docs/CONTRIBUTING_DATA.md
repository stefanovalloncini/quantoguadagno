# Come si aggiornano i dati fiscali

La legge fiscale italiana cambia ogni dicembre con la Legge di Bilancio, e in corso d'anno con
circolari INPS, decreti MEF e delibere regionali. Questa guida dice dove mettere le mani, in che
ordine, e cosa deve contenere la pull request perché il numero resti tracciabile.

Regola di fondo: **nessuna cifra entra nel codice senza una fonte ufficiale citata in
`docs/data-verification/`.** Se la fonte non c'è, il dato non si aggiunge.

## Dove stanno i dati

```
src/data/
  types.ts        Source, Entry, ParamDefinition: la forma di ogni voce del registro
  define.ts       effective(), revaluedYearly(), cite(), verifiedInPhase0()
  sources.ts      leggi e circolari citate da più parametri
  params/         i parametri per materia, ognuno una lista di { from, value, source }
    irpef.ts      scaglioni, detrazione lavoro dipendente, trattamento integrativo, cuneo
    inps.ts       prima fascia, massimale, aliquote dei dipendenti, esonero 2024
    autonomi.ts   aliquote, minimale e riduzioni di artigiani, commercianti, gestione separata
    deductions.ts detrazioni per familiari e per spese
    fringeBenefits.ts soglie e tabelle dei fringe benefit
    employer.ts   contributi del datore e TFR
    specialConditions.ts madri lavoratrici, impatriati, premio di risultato
    forfettario.ts aliquote, soglie e coefficienti di redditività ATECO
    naspi.ts      soglia, massimale e riduzione NASpI
    regions.ts    addizionale regionale IRPEF, 21 regioni e province autonome, anno per anno
  stored.ts       tutte le chiavi dei moduli di params/
  derived.ts      i valori ricavati da altri: massimale ante 1996, contributi minimi, aliquote oltre la fascia
  registry.ts     param(chiave, data), SUPPORTED_YEARS, LATEST_SUPPORTED_YEAR
  regions.ts      REGIONS e REGIONS_LIST, lette dal registro
  comuni.ts       addizionale comunale: file per regione e regola dell'anno
  comuni/         i file dei comuni, generati da scripts/data/import-comuni.mjs
  ccnl.ts         tabelle CCNL dei termini di preavviso e mensilità tipiche
  forfettarioActivities.ts categorie ATECO del forfettario
  inflation.ts    serie ISTAT FOI
  fonti.ts        elenco dei parametri, lista "da verificare", data dell'ultima verifica

src/domain/taxConfig.ts               getTaxConfig(year): la configurazione dell'anno, letta dal registro
docs/data-verification/<materia>.md   la scheda che giustifica ogni cifra
tests/golden/                         i casi calcolati a mano dalle norme, fonte per fonte
src/data/*.test.ts                    forma del registro, anni supportati, derivati, comuni
src/domain/taxConfig*.test.ts         i valori delle circolari, anno per anno
src/domain/*.test.ts                  i test di ogni calcolo, accanto al modulo
```

Il criterio per scegliere il file: ogni parametro sta nel modulo della sua materia in
`src/data/params/`, con una voce per ogni data da cui cambia valore; una voce resta in vigore finché
non arriva la successiva. Se un valore si ricava da altri sta in `src/data/derived.ts`. Se non
dipende dall'anno fiscale ma dalla materia (CCNL, ATECO) sta nel file di materia.

Le funzioni in `src/domain/` non contengono cifre. Leggono `getTaxConfig(year)` e le tabelle
di materia, e basta. Se ti trovi a scrivere un numero dentro un calcolo, è nel posto sbagliato.

## Aggiungere un anno fiscale

Si fa quando la Legge di Bilancio è pubblicata in Gazzetta Ufficiale, non prima. Un disegno di
legge non è una fonte.

1. Aggiungi a ogni parametro rivalutato ogni anno (`revaluedYearly`: prima fascia e massimale
   INPS, minimale di artigiani e commercianti, soglia e massimale NASpI, addizionale di ogni
   regione) la voce `{ from: "2027-01-01", value, source }`, riscritta dalla circolare del nuovo
   anno anche se "sembra uguale". È così che il 2024 e il 2025 avevano ereditato i valori del
   2026: `src/data/registry.test.ts` fallisce finché manca una voce, e
   `src/domain/taxConfig.autonomi.test.ts` controlla i valori.
2. `SUPPORTED_YEARS`, `LATEST_SUPPORTED_YEAR` e il tipo `SupportedYear` si ricavano da quelle voci:
   non c'è un elenco di anni da aggiornare a mano.
3. Aggiungi una voce datata a ogni aliquota, scaglione, soglia e massimale che è cambiato, con la
   fonte nella `source` della voce. I valori invariati non si riscrivono: la voce precedente resta
   in vigore. I valori ricavati da altri (`src/data/derived.ts`) si aggiornano da soli.
4. Compila la `source` con la Gazzetta Ufficiale della legge o la circolare INPS dell'anno (`ref`,
   `url`, `published`). `verified` si scrive solo dopo il controllo sulla fonte primaria: senza, la
   voce compare nella lista "da verificare" (`daVerificare()` in `src/data/fonti.ts`).
5. La configurazione dell'anno (`getTaxConfig`, `getAutonomiConfig`, `getNaspiConfig` in
   `src/domain/taxConfig.ts`) si costruisce dal registro al 1° gennaio: non c'è niente da copiare.
6. Nei link il parametro `y` si valida con `isSupportedYear()`, che segue il registro: nessun anno
   elencato a mano.
7. Il registro vede solo cambi al 1° gennaio: se una voce parte in corso d'anno,
   `src/domain/taxConfig.adapter.test.ts` fallisce e la configurazione annuale va ripensata.
8. Aggiungi l'anno alle tabelle di `src/domain/taxConfig.test.ts` e
   `src/domain/taxConfig.autonomi.test.ts` (i `Record<SupportedYear, …>` non compilano finché
   manca), aggiungi le regole regionali dell'anno in `src/data/params/regions.ts`, e scrivi almeno
   tre casi nuovi in `tests/golden/` ricalcolati dalle norme (vedi "I vettori").
9. Aggiorna le schede in `docs/data-verification/` toccate dalla modifica, con la nuova riga in
   tabella, il riferimento di legge e la nuova data di verifica.
10. `pnpm typecheck && pnpm lint && pnpm test && pnpm build`.

## Aggiornare un'aliquota

1. Apri il modulo della materia in `src/data/params/` e trova la chiave: ogni voce ha nella
   `source` la norma che la fissa.
2. Aggiungi una voce con la data da cui vale il nuovo valore, con la sua fonte. Non cambiare le
   voci passate, e non lasciare il valore nuovo con la vecchia citazione: è peggio di nessuna
   citazione.
3. Compila `source.ref`, `source.url`, `source.published` e, dopo il controllo, `source.verified`.
4. Apri la scheda in `docs/data-verification/` e correggi la tabella, l'esempio svolto e la data
   di ultima verifica.
5. Ricalcola i vettori che dipendono da quel valore e aggiorna le attese nei test. Se un test
   cambia risultato senza che tu abbia capito perché, fermati: o la modifica tocca più cose di
   quanto pensavi, o l'attesa precedente era sbagliata.
6. `pnpm test`.

Le aliquote sono sempre frazioni: `0.0123`, mai `1.23`. Gli importi sono sempre in euro pieni,
con l'underscore a separare le migliaia (`56_224`).

## Aggiungere o ritirare una misura temporanea

Alcune misure valgono per un anno solo (l'esonero contributivo 2024) o arrivano e poi diventano
strutturali (il taglio del cuneo). Nel registro sono parametri con voci `null` per i periodi in cui
la misura non esiste, e in `YearlyTaxConfig` campi tipizzati che valgono `null` negli stessi anni:
`irpef.taxWedgeCut` (`taxWedgeCut`) e `inps.employee.exemption2024` (`inpsExemption2024`) sono i
due casi già presenti.

Per aggiungerne una:

1. Definisci l'interfaccia dei parametri nel modulo della materia in `src/data/params/`, e
   riesportala dal modulo `src/domain/<misura>.ts` che la applica, come fanno le altre.
2. Aggiungi il campo a `YearlyTaxConfig` in `src/domain/taxConfig.ts` come `<Misura>Config | null`.
3. Dai al parametro una voce `null` dal primo anno supportato e una voce con il valore dalla data
   in cui la misura entra in vigore. Lasciare fuori gli anni vecchi non è un'opzione: `param()`
   lancia un errore prima della prima voce, ed è l'errore a impedire che una misura resti accesa
   per dimenticanza.
4. Scrivi la funzione di calcolo con il suo test, in TDD, e collegala in `composer.ts`.
5. Scrivi `docs/data-verification/<misura>.md` con la norma, il link e un esempio svolto.

Per ritirarne una: aggiungi una voce `null` dal nuovo anno e **non toccare gli anni passati**. Un
calcolo del 2024 deve continuare a restituire quello che restituiva nel 2024. Se la misura non è
più in vigore in nessun anno supportato, allora si può togliere il campo, la funzione e i test
insieme.

## Aggiornare l'addizionale regionale

Le aliquote regionali stanno in `src/data/params/regions.ts`, con la stessa forma degli scaglioni
IRPEF. La tabella deve rispettare quattro regole:

- il primo scaglione parte da `min: 0`;
- l'ultimo ha `max: null`;
- il `min` di ogni scaglione è uguale al `max` del precedente, senza buchi;
- `exemptionThreshold` azzera l'imposta fino a quella soglia, e sopra non ha effetto;
- `taxDeduction` sottrae un importo fisso dall'imposta fino a `incomeCeiling`, con il risultato mai
  sotto zero.

`src/data/regions.test.ts` verifica queste regole su tutte le regioni e tutti gli anni;
`src/domain/regionalTaxCalculations.test.ts` copre i casi di calcolo.

`exemptionThreshold` descrive un'esenzione vera (Valle d'Aosta) o una deduzione dalla base con
effetto a scalino (Trento). Una detrazione d'imposta va invece su `taxDeduction`, come per la
provincia di Bolzano. Prima di modellare una regione, leggi sulla pagina MEF quale dei tre
strumenti la legge usa davvero: producono importi diversi sulla stessa aliquota.

La tabella è versionata per anno (una voce per anno nel parametro `regions.<codice>`, letta da
`REGIONS[codice].rules[anno]`): una modifica regionale si scrive nell'anno in cui entra in vigore e
non tocca gli anni passati. Le regole particolari (aliquota unica fino a una
soglia, detrazioni per fascia di reddito) hanno campi propri, descritti in
`docs/data-verification/regional-brackets.md`.

## I vettori

I vettori sono i casi di test con attese calcolate fuori dal codice:

- `tests/golden/employee.golden.test.ts` e `tests/golden/forfettario.golden.test.ts`: casi completi
  (tutte le righe del cedolino, al centesimo), ognuno con la fonte scritta nel campo `source`;
- `src/domain/taxConfig.test.ts` e `src/domain/taxConfig.autonomi.test.ts`: i valori pubblicati
  nelle circolari, anno per anno;
- `src/domain/composer.properties.test.ts`: regole che valgono per qualsiasi input (nessuna
  imposta negativa, le righe sommano al netto, niente addizionali senza IRPEF netta).

Quello che rende un vettore affidabile:

- gli input sono scritti per esteso nel test, non costruiti da una fixture condivisa;
- l'attesa viene da una fonte esterna al codice (l'esempio delle istruzioni Agenzia Entrate, la
  circolare INPS, un caso svolto in una scheda di verifica, un calcolo indipendente dalle norme),
  non dall'output del programma;
- la fonte è scritta accanto al caso.

Quando un'attesa cambia perché è cambiata la legge, cambia anche la fonte. Quando cambia perché il
motore è stato corretto, la scheda di verifica spiega l'errore precedente.

## Arrotondamento

Ogni riga del cedolino (contributi, imponibile, IRPEF lorda, ogni detrazione, addizionali,
trattamento integrativo, somma del cuneo) si arrotonda al centesimo, per eccesso da 0,5, e il netto
si ottiene da quelle righe già arrotondate. Così le righe mostrate sommano sempre al netto mostrato:
lo verifica `composer.properties.test.ts`. Per l'esempio di AGENTS.md (2026, RAL 35.000 €,
Lombardia) il netto è 26.032,21 €.

## Cosa deve contenere la pull request

- [ ] ogni cifra modificata è tracciabile a una pubblicazione ufficiale;
- [ ] la `source` della voce cita la norma o la circolare giusta;
- [ ] `source.ref`, `source.url`, `source.published` e `source.verified` sono aggiornati;
- [ ] la scheda in `docs/data-verification/` riporta la modifica, con almeno un esempio svolto;
- [ ] i vettori toccati sono aggiornati e il commento spiega perché l'attesa è cambiata;
- [ ] `pnpm typecheck && pnpm lint && pnpm format:check && pnpm test && pnpm build` è verde;
- [ ] i risultati degli anni passati non sono cambiati (se sono cambiati, la PR dice perché).

Una PR che tocca i dati e non tocca nessun test è quasi sempre incompleta: o il dato non influisce
su niente, e allora non serve, oppure influisce e manca il vettore.
