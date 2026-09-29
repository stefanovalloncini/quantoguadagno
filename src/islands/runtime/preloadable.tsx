import { createElement, lazy, type ComponentType } from "react";

export interface Preloadable<P extends object> {
  readonly Component: ComponentType<P>;
  readonly load: () => Promise<unknown>;
}

export function preloadable<P extends object>(
  loader: () => Promise<{ readonly default: ComponentType<P> }>,
): Preloadable<P> {
  let loaded: ComponentType<P> | null = null;
  let pending: Promise<{ readonly default: ComponentType<P> }> | null = null;
  const load = () => {
    pending ??= loader().then((module) => {
      loaded = module.default;
      return module;
    });
    return pending;
  };
  const Deferred = lazy(load);
  function Component(props: P) {
    return createElement(loaded ?? (Deferred as unknown as ComponentType<P>), props);
  }
  return { Component, load };
}
