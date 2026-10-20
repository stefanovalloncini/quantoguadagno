import type { MessageKey } from "./it.ts";

export const en: Record<MessageKey, string> = {
  "preavviso.faq.title": "Understanding notice periods",
  "preavviso.faq.obbligatorio.q": "Am I required to give notice?",
  "preavviso.faq.obbligatorio.a":
    "Yes, except for resignation for just cause (Art. 2119 c.c., for example unpaid wages or harassment) or during the trial period. The days depend on the CCNL, your level, and your length of service.",
  "preavviso.faq.mancato.q": "What happens if I don’t give notice?",
  "preavviso.faq.mancato.a":
    "The employer can withhold an indemnity equivalent to the wages you would have earned during those days. It is deducted from your TFR and final payslip.",
  "preavviso.faq.calendarOrWork.q": "Are notice days calendar days or working days?",
  "preavviso.faq.calendarOrWork.a":
    "By default they are calendar days: Saturdays, Sundays and public holidays count. Some CCNLs prescribe working days for specific levels (the calculator flags this case when it applies).",
  "preavviso.faq.ferie.q": "Do unused holidays count toward notice?",
  "preavviso.faq.ferie.a":
    "No. The Civil Code does not allow the notice period to be counted as holiday (art. 2109): holiday days taken during the notice do not count as notice, so it ends later. Unused holidays are paid out in the final payslip and do not shorten the notice.",
  "preavviso.faq.malattia.q": "Can I resign while on sick leave?",
  "preavviso.faq.malattia.a":
    "Yes, illness does not prevent you from resigning. Most CCNLs suspend the notice period while the illness lasts and resume it on recovery, so check your contract: the calculator does not account for absences.",
  "preavviso.faq.prova.q": "What changes during the trial period?",
  "preavviso.faq.prova.a":
    "During the trial period either party can terminate without notice and without giving reasons (Art. 2096 c.c.). The calculator treats this as a separate case.",
  "preavviso.title": "Resignation notice",
  "preavviso.lede":
    "How many days of notice you owe and your last day of work, based on your CCNL, level, and length of service.",
  "preavviso.form.ccnl": "Applicable CCNL",
  "preavviso.form.livello": "Level / category",
  "preavviso.form.hireDate": "Hire date",
  "preavviso.form.hireDate.hint": "The first day of work under the current contract.",
  "preavviso.form.resignationDate": "Resignation communication date",
  "preavviso.form.resignationDate.hint": "The day you give notice, today by default.",
  "preavviso.form.error.invalidDates": "Resignation date must be after the hire date.",
  "preavviso.form.ccnl.error": "Choose a valid CCNL.",
  "preavviso.form.livello.error": "Choose a valid level for the selected CCNL.",
  "preavviso.result.noticeDays": "Notice days",
  "preavviso.result.fix": "Fix the dates to calculate the notice period.",
  "preavviso.result.exitDate": "Last day of work: {date}",
  "preavviso.result.band": "Seniority {band}, grade {livello}",
  "preavviso.result.band.lt-5y": "less than 5 years",
  "preavviso.result.band.5-10y": "5 to 10 years",
  "preavviso.result.band.gt-10y": "more than 10 years",
  "preavviso.result.band.lte-3y": "up to 3 years",
  "preavviso.result.band.gt-3y": "more than 3 years",
  "preavviso.result.workingDays.note": "These are working days (Saturdays and Sundays excluded).",
  "preavviso.result.calendarDays.note": "These are calendar days.",
  "preavviso.result.source": "Source: {ref}.",
  "preavviso.days": "{count, plural, one {# day} other {# days}}",
  "preavviso.assumptions.ccnl": "{ccnl}, {livello}",
  "preavviso.assumptions.dates": "Hired on {hire}, resignation given on {resignation}",
  "preavviso.assumptions.change.ccnl": "the CCNL and level",
  "preavviso.assumptions.change.dates": "the dates",
  "preavviso.table.title": "Notice days by level and seniority",
  "preavviso.table.caption":
    "Notice days required by the selected CCNL, by level and seniority band",
  "preavviso.table.livello": "Level",
  "preavviso.table.workingDaysSuffix": ", working days",
};
