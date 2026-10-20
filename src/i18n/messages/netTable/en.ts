import type { MessageKey } from "./it.ts";

export const en: Record<MessageKey, string> = {
  "netTable.scenario":
    "For a permanent employee in the private sector who lives in {city}, with {count} payslips a year and no dependants.",
  "netTable.action": "Calculate with your details",
  "netTable.understand.title": "Understanding the calculation",

  "netTable.column.gross": "Gross (RAL)",
  "netTable.column.net": "Annual net",
  "netTable.column.monthly": "Monthly over {count}",
  "netTable.column.withheld": "Deductions",
  "netTable.inline.monthly": "{count} payslips:",
  "netTable.inline.withheld": "deductions:",
  "netTable.row.suffix": "gross",

  "netTable.hub.title": "Gross to net table {year}",
  "netTable.hub.table.title": "All amounts",
  "netTable.hub.table.caption": "Net pay in {year} by gross salary, living in {city}",
  "netTable.hub.withheld":
    "Deductions: the part of the gross salary that does not reach the net, that is INPS contributions, IRPEF and surcharges less the payroll credits.",
};
