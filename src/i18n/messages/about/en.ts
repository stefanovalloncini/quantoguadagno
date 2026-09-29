import type { MessageKey } from "./it.ts";

export const en: Record<MessageKey, string> = {
  "about.title": "About",
  "about.lede":
    "Quanto guadagno estimates net pay and other work figures in Italy. It is free, needs no account and collects no data about you.",
  "about.toc": "On this page",

  "about.what.title": "What it calculates",
  "about.what.body":
    "It starts from gross pay and follows the payslip: INPS contributions, income tax (IRPEF), deductions, regional and municipal surcharges, credits. There are also calculators for the thirteenth month, severance pay (TFR), NASpI, resignation notice, employer cost, the forfettario regime and inflation. The rules cover {years}.",
  "about.what.link": "Read how we calculate net pay",

  "about.limits.title": "What it is not",
  "about.limits.estimate":
    "It is an estimate: your payslip remains the reference. The calculation does not know your collective agreement, your other income or the year-end tax adjustment.",
  "about.limits.advice":
    "It is not tax advice. For an important decision, ask a payroll consultant, an accountant or a tax assistance centre (CAF).",

  "about.data.title": "Where the data comes from",
  "about.data.body":
    "Rates and thresholds come from laws, INPS circulars and public data from the Italian Department of Finance and the national statistics institute (ISTAT). Every value has its source and the date it was last checked: of the {total} parameters used for {year}, {verified} are verified and {toVerify} are still to verify.",
  "about.data.link": "See sources and data",

  "about.privacy.title": "Your data",
  "about.privacy.calculation":
    "The salary and other values you enter stay in your browser: the calculations happen there. The site sets no cookies and uses no analytics.",
  "about.privacy.storage":
    "Your browser remembers only the theme and language you choose and, if you use it, your salary history. You can clear them in your browser settings.",
  "about.privacy.links":
    "If you share a link to a calculation, the main values are written in the address: anyone who opens it sees them.",

  "about.code.title": "Open source",
  "about.code.body":
    "The code is public under the MIT licence: you can read it, check every calculation and report a mistake.",
  "about.code.link": "Read the code on GitHub",
};
