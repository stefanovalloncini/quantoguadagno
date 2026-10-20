import type { APIRoute } from "astro";
import { NET_TABLE_AMOUNTS, netTablePaths } from "@/islands/netTable/amounts.ts";
import { ROUTES } from "@/routes.ts";
import { buildSitemap } from "@/seo/sitemap.ts";

export const GET: APIRoute = () =>
  new Response(buildSitemap(ROUTES, NET_TABLE_AMOUNTS.map(netTablePaths)), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
