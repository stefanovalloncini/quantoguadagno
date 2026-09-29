import { useMemo, useState } from "react";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useShownResult } from "./useShownResult.ts";

function useDoubler(initial: string) {
  const [text, setText] = useState(initial);
  const current = useMemo(() => {
    const value = Number(text);
    return text !== "" && Number.isFinite(value) ? { doubled: value * 2 } : null;
  }, [text]);
  return { text, setText, ...useShownResult(current, setText) };
}

describe("useShownResult", () => {
  it("shows the current result while the input is valid", () => {
    const { result } = renderHook(() => useDoubler("2"));
    expect(result.current.result).toEqual({ doubled: 4 });
    expect(result.current.stale).toBe(false);
  });

  it("keeps the result the visitor saw, marked stale, once a change breaks the input", () => {
    const { result } = renderHook(() => useDoubler("2"));
    act(() => {
      result.current.change(() => "x");
    });
    expect(result.current.text).toBe("x");
    expect(result.current.result).toEqual({ doubled: 4 });
    expect(result.current.stale).toBe(true);
    act(() => {
      result.current.change(() => "y");
    });
    expect(result.current.result).toEqual({ doubled: 4 });
    act(() => {
      result.current.change(() => "5");
    });
    expect(result.current.result).toEqual({ doubled: 10 });
    expect(result.current.stale).toBe(false);
  });

  it("shows nothing when the input was never valid while the visitor watched", () => {
    const { result } = renderHook(() => useDoubler("2"));
    act(() => {
      result.current.setText("x");
    });
    expect(result.current.result).toBeNull();
    expect(result.current.stale).toBe(false);
  });
});
