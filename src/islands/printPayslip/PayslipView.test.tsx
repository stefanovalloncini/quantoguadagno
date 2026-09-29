import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getMessages } from "@/i18n/messages/index.ts";
import PrintPayslip from "@/islands/PrintPayslip.tsx";
import { RESTORE_PENDING_ATTRIBUTE } from "@/islands/runtime/restoreSignal.ts";

const MESSAGES = {
  it: getMessages("it", ["form", "printPayslip"]),
  en: getMessages("en", ["form", "printPayslip"]),
};

function open(url: string, locale: "it" | "en" = "it") {
  window.history.replaceState(null, "", url);
  return render(<PrintPayslip locale={locale} messages={MESSAGES[locale]} />);
}

afterEach(() => {
  window.history.replaceState(null, "", "/");
  document.documentElement.removeAttribute(RESTORE_PENDING_ATTRIBUTE);
  vi.restoreAllMocks();
});

describe("PrintPayslip", () => {
  it("lays out the reference sheet of the approved board", async () => {
    open("/stampa-busta-paga?l=35000&k=F205");
    expect(screen.getByRole("status")).toHaveTextContent("Carico l’aliquota del comune.");
    await screen.findByRole("heading", { name: "Riepilogo annuo dello stipendio" });
    expect(screen.getByText("Milano, 0,80%")).toBeInTheDocument();
    expect(document.querySelector(".qg-payslip__net-value")).toHaveTextContent("26.032,21 €");
    expect(screen.getAllByText("8.967,79 €").length).toBeGreaterThan(0);
    expect(screen.getByText("2.417,59 €")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Torna al calcolo" })).toHaveAttribute(
      "href",
      "/?l=35000&k=F205",
    );
  });

  it("states the net a sheet was solved from", async () => {
    open("/stampa-busta-paga?s=n&n=1800");
    await screen.findByText(/ricavata dal netto di 1\.800,00 € al mese/);
  });

  it("prints on request", async () => {
    const print = vi.spyOn(window, "print").mockImplementation(() => undefined);
    open("/stampa-busta-paga?l=40000");
    const button = await screen.findByRole("button", { name: "Stampa o salva in PDF" });
    button.click();
    expect(print).toHaveBeenCalledOnce();
  });

  it("explains a link it cannot use and offers the way back", async () => {
    open("/stampa-busta-paga?c=5");
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Aliquota dell’addizionale comunale: Scrivi una percentuale da 0% a 1,5%",
      );
    });
    expect(screen.queryByRole("button", { name: "Stampa o salva in PDF" })).toBeNull();
  });

  it("speaks English", async () => {
    open("/en/print-payslip?l=35000", "en");
    await screen.findByRole("heading", { name: "Annual salary summary" });
    expect(screen.getByRole("link", { name: "Back to the calculation" })).toHaveAttribute(
      "href",
      "/en?l=35000",
    );
  });
});
