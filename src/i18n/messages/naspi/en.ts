import type { MessageKey } from "./it.ts";

export const en: Record<MessageKey, string> = {
  "naspi.title": "Unemployment benefit (NASpI)",
  "naspi.lede":
    "How much you get each month, and for how long, if you lose your job through no choice of your own, under the INPS rules from {first} to {last}.",

  "naspi.year.legend": "Year the job ended",
  "naspi.year.hint": "The year your employment came to an end.",
  "naspi.gross.label": "Gross pay over the last 4 years",
  "naspi.gross.hint":
    "The total pensionable pay on your Certificazioni Uniche (CU, the yearly pay statements), without severance pay (TFR): with 4 years of work it is about 4 times your gross annual salary.",
  "naspi.gross.readAs": "Read as {amount}",
  "naspi.gross.monthly":
    "That is {amount} gross a month on average over the {weeks, plural, one {# week} other {# weeks}}",
  "naspi.weeks.label": "Weeks of contributions in the last 4 years",
  "naspi.weeks.hint":
    "At least 13; a full year is 52 weeks, maternity and parental leave included.",
  "naspi.weeks.unit": "weeks",
  "naspi.age.label": "Age when you apply",
  "naspi.age.hiddenUnit": "in years",
  "naspi.age.hint": "From 55 the reduction starts in month 8 instead of month 6.",
  "naspi.age.unit": "years",
  "naspi.resigned.label": "You resigned from a permanent contract in the last 12 months",
  "naspi.resigned.hint":
    "In that case you need at least 13 weeks of contributions after the resignation.",
  "naspi.weeksAfter.label": "Weeks of contributions after the resignation",
  "naspi.weeksAfter.hint": "The weeks of the job you started after resigning.",

  "naspi.net.title": "To estimate the net amount",
  "naspi.net.recap": "{other}; {residence}",
  "naspi.net.recap.noOther": "No other income in {year}",
  "naspi.net.recap.other": "{amount} of other income in {year}",
  "naspi.net.recap.comune": "{comune}, {region}",
  "naspi.net.recap.rate": "{region}, municipal surcharge {rate}",
  "naspi.other.label": "Other employment income in {year}",
  "naspi.other.hint":
    "Include your {year} salary up to the end of the job: with other income, the income tax on NASpI goes up.",
  "naspi.region.label": "Region of residence",

  "naspi.result.label": "Gross monthly amount",
  "naspi.result.basis.first":
    "{months, plural, one {in the first month} other {in the first # months}}",
  "naspi.result.basis.all": "{months, plural, one {for its only month} other {for all # months}}",
  "naspi.result.net.alone": "About {amount} net a month, if you have no other income in {year}",
  "naspi.result.net.other": "About {amount} net a month, with {other} of other income in {year}",
  "naspi.result.total":
    "For {weeks, plural, one {# week} other {# weeks}}, {months, plural, one {about # month} other {about # months}}: {total} gross in all",
  "naspi.result.empty": "Enter your gross pay over the last 4 years to see the amount.",
  "naspi.result.fix": "Correct the marked values to see the amount.",
  "naspi.result.stale":
    "Out of date: this is the previous result. Correct the marked values to recalculate.",
  "naspi.result.announce":
    "Gross monthly amount {amount} {basis}, about {net} net. {total} gross in all.",
  "naspi.result.announce.none": "You are not entitled to NASpI. {reason}",

  "naspi.none.answer": "You are not entitled to NASpI",
  "naspi.ineligible.insufficient-weeks":
    "You need at least {min} weeks of contributions in the last 4 years: {weeks, plural, =0 {you entered none} one {you entered #} other {you entered #}}.",
  "naspi.ineligible.voluntary-resignation-lockout":
    "After resigning in the last 12 months you need at least {min} weeks of contributions: {weeks, plural, =0 {you entered none} one {you entered #} other {you entered #}}.",
  "naspi.check.title": "What to check",
  "naspi.check.statement":
    "The weeks on your contribution statement, in your personal area on the INPS website: maternity and parental leave count too.",
  "naspi.check.period": "The period: only the weeks in the 4 years before the job ended count.",
  "naspi.check.afterResignation": "Only the weeks of the job you started after resigning count.",

  "naspi.assume.year": "Job ended in {year}",
  "naspi.assume.year.change": "year the job ended",
  "naspi.assume.gross": "{amount} gross over 4 years",
  "naspi.assume.gross.change": "gross pay",
  "naspi.assume.weeks": "{weeks, plural, one {# week} other {# weeks}} of contributions",
  "naspi.assume.weeks.change": "weeks of contributions",
  "naspi.assume.age": "{age, plural, one {# year} other {# years}} old when you apply",
  "naspi.assume.age.change": "age",
  "naspi.assume.noResignation": "No resignation in the last 12 months",
  "naspi.assume.resignation":
    "Resigned in the last 12 months, {weeks, plural, one {# week} other {# weeks}} after",
  "naspi.assume.resignation.change": "resignation",
  "naspi.assume.other.change": "other income",
  "naspi.assume.comune": "Resident in {comune}, {regionIn}",
  "naspi.assume.rate": "Resident {regionIn}, municipal surcharge {rate}",
  "naspi.assume.residence.change": "residence",

  "naspi.note.estimate":
    "INPS works out the exact amount and also withholds income tax. We do not account for new jobs while you receive NASpI.",
  "naspi.note.decision": "INPS decides when it assesses your application.",
  "naspi.note.verified": "Data checked on {date}",
  "naspi.note.trust":
    "{checked}{pending, select, yes {: {count, plural, one {one value used in this calculation is still to be verified} other {# values used in this calculation are still to be verified}}} other {}}.",

  "naspi.ledger.title": "How the amount is worked out",
  "naspi.ledger.caption": "NASpI calculation for {year}, gross amounts in euro",
  "naspi.ledger.term": "Item",
  "naspi.ledger.value": "Value",
  "naspi.ledger.reference": "Monthly reference pay",
  "naspi.ledger.reference.rule": "average over the last 4 years",
  "naspi.ledger.reference.explain":
    "{gross} divided by {weeks, plural, one {# week} other {# weeks}}, times 52 weeks divided by 12 months. The law speaks of 4.33 weeks a month: the value we use is one of those still to be verified.",
  "naspi.ledger.first": "First month’s amount",
  "naspi.ledger.first.rule.base": "75% of the reference pay",
  "naspi.ledger.first.rule.split": "75% up to {threshold}, 25% above",
  "naspi.ledger.first.rule.capped": "at the {year} cap",
  "naspi.ledger.first.explain.base":
    "75% of {reference}, which stays below the {threshold} threshold. In {year} the amount cannot exceed {cap}.",
  "naspi.ledger.first.explain.split":
    "75% of the pay up to the {threshold} threshold, plus 25% of the part above it: {base} + {extra}. In {year} the amount cannot exceed {cap}.",
  "naspi.ledger.first.explain.capped":
    "75% up to the {threshold} threshold and 25% above it would give {uncapped}, but in {year} the amount cannot exceed {cap}.",
  "naspi.ledger.duration": "Duration",
  "naspi.ledger.duration.rule": "half the weeks of contributions",
  "naspi.ledger.duration.value": "{weeks, plural, one {# week} other {# weeks}}",
  "naspi.ledger.duration.explain":
    "{weeks, plural, one {# week} other {# weeks}} of contributions give {duration, plural, one {# week} other {# weeks}} of NASpI, {months, plural, one {about # month} other {about # months}}. {capped, select, yes {That is the maximum: 104 weeks, about 24 months.} other {The maximum is 104 weeks, about 24 months.}}",
  "naspi.ledger.reduction": "Reduction",
  "naspi.ledger.reduction.rule": "{start, select, 8 {from month 8} other {from month 6}}",
  "naspi.ledger.reduction.value": "{rate} a month",
  "naspi.ledger.reduction.explain":
    "{start, select, 8 {From month 8} other {From month 6}} the amount drops by {rate} every month, applied to the previous month’s amount. {start, select, 8 {You are 55 or older: the reduction starts two months later.} other {From 55 the reduction starts in month 8.}}",
  "naspi.ledger.reduction.none": "NASpI ends sooner: the reduction does not apply.",
  "naspi.ledger.total": "Gross total",
  "naspi.ledger.total.rule": "{months, plural, one {one month} other {sum of # months}}",
  "naspi.ledger.total.explain":
    "{months, plural, one {The amount of the only month, in the table below.} other {The sum of the # monthly amounts in the table below.}}",

  "naspi.estimate.title": "How we estimate the net amount",
  "naspi.estimate.caption": "Net NASpI estimate for {year}, amounts in euro",
  "naspi.estimate.period": "{months, plural, one {In the month} other {Over # months}}",
  "naspi.estimate.period.first": "First 12 months",
  "naspi.estimate.gross": "Gross total",
  "naspi.estimate.gross.rule": "{months, plural, one {# month of NASpI} other {# months of NASpI}}",
  "naspi.estimate.gross.rule.first": "first 12 months of NASpI",
  "naspi.estimate.gross.alone": "The estimate treats NASpI as your only income in {year}.",
  "naspi.estimate.gross.other":
    "NASpI adds to your other {other} of income in {year}: the taxes we attribute to it are the extra over your other income alone.",
  "naspi.estimate.gross.later": "After month 12 we use the same share of taxes.",
  "naspi.estimate.irpef": "Net income tax (IRPEF)",
  "naspi.estimate.irpef.rule.flat": "{rate}, minus the employment income deduction",
  "naspi.estimate.irpef.rule.bands": "by brackets, minus the employment income deduction",
  "naspi.estimate.irpef.explain":
    "NASpI is subject to personal income tax (IRPEF), with the same deduction as a salary.",
  "naspi.estimate.irpef.gross.flat": "Gross income tax: {rate} of {income}",
  "naspi.estimate.irpef.gross.bands": "Gross income tax, by brackets on {income}",
  "naspi.estimate.irpef.deduction":
    "Employment income deduction, art. 13 of the consolidated income tax law (TUIR)",
  "naspi.estimate.irpef.net": "Net income tax",
  "naspi.estimate.irpef.withOther": "Net income tax on {income}, NASpI and other income",
  "naspi.estimate.irpef.otherOnly": "Net income tax on the other income alone",
  "naspi.estimate.irpef.share": "Share due to NASpI",
  "naspi.estimate.regional": "Regional surcharge",
  "naspi.estimate.regional.rule": "{region}, {rates}",
  "naspi.estimate.regional.explain": "The rates {regionOf} for {year}, applied to {income}.",
  "naspi.estimate.local.withOther":
    "The difference between the surcharge on {total} and the one on your other income alone.",
  "naspi.estimate.local.none": "Not due: with net income tax at zero, no surcharges apply.",
  "naspi.estimate.municipal": "Municipal surcharge",
  "naspi.estimate.municipal.rule.exempt": "{comune}, exempt up to {amount}",
  "naspi.estimate.municipal.rule.comune": "{comune}, {rate}",
  "naspi.estimate.municipal.rule.rate": "{rate}, no municipality chosen",
  "naspi.estimate.municipal.explain.exempt":
    "With {income} of income you stay below the {comune} exemption threshold.",
  "naspi.estimate.municipal.explain.comune": "The {comune} rate for {year}, applied to {income}.",
  "naspi.estimate.municipal.explain.rate":
    "Without a municipality we use {article, select, other {}}{rate}: choose yours under “To estimate the net amount”.",
  "naspi.estimate.net": "Estimated net",
  "naspi.estimate.net.rule": "{share} in taxes",
  "naspi.estimate.net.explain":
    "{months, plural, one {In the first month} other {In the first # months}}, {amount} minus {article, select, other {}}{share} gives {net}, hence “about {rounded}”. The table below shows it month by month.",

  "naspi.chart.title": "Month by month",
  "naspi.chart.hint":
    "The chart and the table show the same gross amounts; the table adds the estimated net.",
  "naspi.chart.summary.flat":
    "Gross NASpI amount month by month: {amount} for all {months} months.",
  "naspi.chart.summary":
    "Gross NASpI amount month by month: {first} {basis}, then down {rate} a month to {last} in month {months}.",
  "naspi.chart.caption": "Gross amount per month, in euro.",
  "naspi.chart.caption.reduction":
    "Gross amount per month, in euro: {start, select, 8 {from month 8} other {from month 6}} each bar is {rate} lower than the one before.",
  "naspi.chart.month": "Month",
  "naspi.table.caption": "Amount month by month",
  "naspi.table.caption.partial":
    "The first {shown} of {months} months are shown; the total covers every month.",
  "naspi.table.month": "Month",
  "naspi.table.gross": "Gross",
  "naspi.table.net": "Estimated net",
  "naspi.table.change": "Compared with month 1",
  "naspi.table.total": "Total",

  "naspi.topics.title": "Understanding NASpI",
  "naspi.topic.who": "Who is entitled to NASpI",
  "naspi.topic.who.body":
    "Anyone who loses their job through no choice of their own: for example after a dismissal, at the end of a fixed-term contract or after resigning for just cause. You need at least 13 weeks of contributions in the last 4 years. Apply to INPS within 68 days of the end of the job.",
  "naspi.topic.duration": "How long NASpI lasts",
  "naspi.topic.duration.body":
    "Half the weeks of contributions in the last 4 years, up to 104 weeks, about 24 months. With 100 weeks of contributions you get 50 weeks of NASpI.",
  "naspi.topic.tax": "Income tax on NASpI",
  "naspi.topic.tax.body":
    "NASpI is taxed like a salary, with the employment income deduction, and INPS withholds the tax every month. That is why we show the gross amount and an estimate of the net, which depends on your other income in the year.",
  "naspi.topic.work": "Working while you receive NASpI",
  "naspi.topic.work.body":
    "You can, but you must tell INPS, which reduces or suspends the benefit depending on the contract and the income. This calculation does not account for it: check your case with INPS.",

  "naspi.bar.label": "Gross monthly amount",
};
