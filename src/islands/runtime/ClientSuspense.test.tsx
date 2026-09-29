import { act, type ReactElement } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToReadableStream } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ClientSuspense } from "./ClientSuspense.tsx";
import { preloadable } from "./preloadable.tsx";

function Details() {
  return <p>details</p>;
}

function Page({ lazyPart }: { readonly lazyPart: ReturnType<typeof preloadable<object>> }) {
  const Part = lazyPart.Component;
  return (
    <div>
      <ClientSuspense fallback={<p>summary</p>}>
        <Part />
      </ClientSuspense>
    </div>
  );
}

async function serverHtml(element: ReactElement): Promise<string> {
  const stream = await renderToReadableStream(element);
  await stream.allReady;
  return new Response(stream).text();
}

describe("ClientSuspense", () => {
  it("renders only the fallback on the server, with no Suspense markers or reveal script", async () => {
    const neverLoads = preloadable<object>(() => new Promise(() => undefined));
    const html = await serverHtml(<Page lazyPart={neverLoads} />);
    expect(html).toBe("<div><p>summary</p></div>");
  });

  it("renders the fallback on the server even when the part is already loaded", async () => {
    const loaded = preloadable<object>(() => Promise.resolve({ default: Details }));
    await loaded.load();
    const html = await serverHtml(<Page lazyPart={loaded} />);
    expect(html).toBe("<div><p>summary</p></div>");
  });

  it("hydrates without mismatches and then shows the lazy part", async () => {
    const part = preloadable<object>(() => Promise.resolve({ default: Details }));
    const container = document.createElement("div");
    container.innerHTML = await serverHtml(<Page lazyPart={part} />);
    const recoverable: unknown[] = [];
    await act(async () => {
      hydrateRoot(container, <Page lazyPart={part} />, {
        onRecoverableError: (error) => recoverable.push(error),
      });
      await part.load();
    });
    expect(recoverable).toEqual([]);
    expect(container.innerHTML).toBe("<div><p>details</p></div>");
  });
});
