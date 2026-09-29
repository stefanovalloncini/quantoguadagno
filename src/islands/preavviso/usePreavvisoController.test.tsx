import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { usePreavvisoController } from "./usePreavvisoController.ts";

describe("usePreavvisoController", () => {
  it("computes notice days and exit date for the default Commercio selection", () => {
    const { result } = renderHook(() => usePreavvisoController());
    expect(result.current.invalidDates).toBe(false);
    expect(result.current.result?.noticeDays).toBe(60);
    expect(result.current.result?.exitDate.toISOString().slice(0, 10)).toBe("2026-07-17");
  });

  it("updates the livello options when the CCNL changes", () => {
    const { result } = renderHook(() => usePreavvisoController());
    act(() => {
      result.current.updateCcnlId("cooperative-sociali");
    });
    expect(result.current.state.ccnlId).toBe("cooperative-sociali");
    expect(result.current.state.livelloId).toBe("a1-c1");
    expect(result.current.derived.noticeTable.map((row) => row.livelloId)).toContain("e2-f2");
  });

  it("shows the working-days case when logistica operai is picked", () => {
    const { result } = renderHook(() => usePreavvisoController());
    act(() => {
      result.current.updateCcnlId("logistica");
    });
    act(() => {
      result.current.updateLivelloId("operai");
    });
    expect(result.current.result?.workingDays).toBe(true);
    expect(result.current.derived.daysNoteKey).toBe("preavviso.result.workingDays.note");
  });

  it("flags the error when resignation precedes hire", () => {
    const { result } = renderHook(() => usePreavvisoController());
    act(() => {
      result.current.updateResignationDate("2010-01-01");
    });
    expect(result.current.invalidDates).toBe(true);
    expect(result.current.result).toBeNull();
    expect(result.current.errors.resignationDate).toBe("preavviso.form.error.invalidDates");
  });

  it("adopts a field value reported from before hydration", () => {
    const { result } = renderHook(() => usePreavvisoController());
    act(() => {
      result.current.adoptField("hireDate", "2015-06-01");
    });
    expect(result.current.state.hireDate).toBe("2015-06-01");
    act(() => {
      result.current.adoptField("ccnlId", "metalmeccanici");
    });
    expect(result.current.state.ccnlId).toBe("metalmeccanici");
    act(() => {
      result.current.adoptField("ccnlId", "not-a-ccnl");
    });
    expect(result.current.state.ccnlId).toBe("metalmeccanici");
  });

  it("resets back to the defaults", () => {
    const { result } = renderHook(() => usePreavvisoController());
    act(() => {
      result.current.updateCcnlId("logistica");
      result.current.updateResignationDate("2030-01-01");
    });
    act(() => {
      result.current.reset();
    });
    expect(result.current.state.ccnlId).toBe("commercio");
    expect(result.current.state.resignationDate).toBe("2026-05-18");
  });
});
