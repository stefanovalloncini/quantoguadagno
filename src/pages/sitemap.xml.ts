import type { APIRoute } from "astro";
import { ROUTES } from "@/routes.ts";
import { buildSitemap } from "@/seo/sitemap.ts";

export const GET: APIRoute = () =>
  new Response(buildSitemap(ROUTES), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
