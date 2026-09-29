import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Comune, RegionCode, RegionComuni } from "@/data/index.ts";
import {
  comuniListOf,
  comuniStore,
  createComuniStore,
  lookupComune,
  useComuni,
} from "./useComune.ts";

const MILANO: Comune = {
  id: "F205",
  name: "Milano",
  province: "MI",
  years: { "2025": { rate: 0.8, exemption: 23_000 } },
};

const LOMBARDIA: RegionComuni = { region: "lombardia", comuni: [MILANO] };

function deferred<T>() {
  let resolve: (value: T) => void = () => undefined;
  let reject: (reason: unknown) => void = () => undefined;
  const promise = new Promise<T>((ok, fail) => {
    resolve = ok;
    reject = fail;
  });
  return { promise, resolve, reject };
}

describe("createComuniStore", () => {
  it("loads a region once and tells subscribers when it arrives", async () => {
    const pending = deferred<RegionComuni>();
    const load = vi.fn<(region: RegionCode) => Promise<RegionComuni>>(() => pending.promise);
    const store = createComuniStore(load);
    const listener = vi.fn();
    store.subscribe(listener);

    store.request("lombardia");
    store.request("lombardia");
    expect(load).toHaveBeenCalledTimes(1);
    expect(store.entry("lombardia")).toEqual({ status: "loading" });

    pending.resolve(LOMBARDIA);
    await pending.promise;
    await Promise.resolve();
    expect(store.entry("lombardia")).toEqual({ status: "ready", regionComuni: LOMBARDIA });
    expect(listener).toHaveBeenCalledTimes(2);
    store.request("lombardia");
    expect(load).toHaveBeenCalledTimes(1);
  });

  it("records a failure and tries again on the next request", async () => {
    const load = vi
      .fn<(region: RegionCode) => Promise<RegionComuni>>()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(LOMBARDIA);
    const store = createComuniStore(load);

    store.request("lombardia");
    await vi.waitFor(() => {
      expect(store.entry("lombardia")).toEqual({ status: "error" });
    });
    store.request("lombardia");
    await vi.waitFor(() => {
      expect(store.entry("lombardia")).toEqual({ status: "ready", regionComuni: LOMBARDIA });
    });
    expect(load).toHaveBeenCalledTimes(2);
  });

  it("stops calling a listener once it unsubscribes", () => {
    const store = createComuniStore(() => new Promise<RegionComuni>(() => undefined));
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    unsubscribe();
    store.request("lazio");
    expect(listener).not.toHaveBeenCalled();
  });
});

describe("lookupComune", () => {
  it("follows the region file to the chosen comune", () => {
    expect(lookupComune(undefined, null)).toEqual({ status: "none" });
    expect(lookupComune(undefined, "F205")).toEqual({ status: "loading", id: "F205" });
    expect(lookupComune({ status: "loading" }, "F205")).toEqual({ status: "loading", id: "F205" });
    expect(lookupComune({ status: "error" }, "F205")).toEqual({ status: "error", id: "F205" });
    expect(lookupComune({ status: "ready", regionComuni: LOMBARDIA }, "F205")).toEqual({
      status: "ready",
      id: "F205",
      comune: MILANO,
    });
    expect(lookupComune({ status: "ready", regionComuni: LOMBARDIA }, "H501")).toEqual({
      status: "missing",
      id: "H501",
    });
  });

  it("exposes the region's list for the picker", () => {
    expect(comuniListOf(undefined)).toEqual({ status: "idle" });
    expect(comuniListOf({ status: "loading" })).toEqual({ status: "loading" });
    expect(comuniListOf({ status: "ready", regionComuni: LOMBARDIA })).toEqual({
      status: "ready",
      comuni: [MILANO],
    });
  });
});

describe("useComuni", () => {
  it("loads the region of a chosen comune and resolves it", async () => {
    const pending = deferred<RegionComuni>();
    const load = vi.fn<(region: RegionCode) => Promise<RegionComuni>>(() => pending.promise);
    const store = createComuniStore(load);
    const { result } = renderHook(() => useComuni("lombardia", "F205", store));

    expect(result.current.selected).toEqual({ status: "loading", id: "F205" });
    expect(load).toHaveBeenCalledWith("lombardia");
    await act(async () => {
      pending.resolve(LOMBARDIA);
      await pending.promise;
    });
    expect(result.current.selected).toEqual({ status: "ready", id: "F205", comune: MILANO });
    expect(result.current.list).toEqual({ status: "ready", comuni: [MILANO] });
  });

  it("loads nothing until a comune is chosen or the picker asks for the list", async () => {
    const load = vi.fn<(region: RegionCode) => Promise<RegionComuni>>(() =>
      Promise.resolve(LOMBARDIA),
    );
    const store = createComuniStore(load);
    const { result } = renderHook(() => useComuni("lombardia", null, store));

    expect(result.current.selected).toEqual({ status: "none" });
    expect(result.current.list).toEqual({ status: "idle" });
    expect(load).not.toHaveBeenCalled();
    act(() => {
      result.current.load();
    });
    await waitFor(() => {
      expect(result.current.list).toEqual({ status: "ready", comuni: [MILANO] });
    });
    expect(load).toHaveBeenCalledTimes(1);
  });

  it("reads the real region files through the shared store", async () => {
    const { result } = renderHook(() => useComuni("molise", "A051"));
    await waitFor(() => {
      expect(result.current.selected.status).toBe("ready");
    });
    expect(result.current.selected).toMatchObject({ comune: { name: "Acquaviva d'Isernia" } });
    expect(comuniStore.entry("molise")?.status).toBe("ready");
  });
});
