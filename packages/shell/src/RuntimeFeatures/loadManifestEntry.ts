/**
 * Imports the entry module of a separate build through the manifest it writes under a fixed
 * name, e.g. `composer-manifest.json`: `{ "entry": "composer-feature.<hash>.js" }`.
 *
 * The entry has a new name in each build, so a replaced build is never served from the browser's
 * cache. The manifest keeps its name, so it is fetched with `cache: "no-store"`: the browser then
 * sends no `If-None-Match`, and a server that kept the ETag of a replaced file can't answer `304`.
 *
 * @param manifestUrl - the manifest, relative to the page
 * @returns the entry module
 * @throws when the manifest can't be fetched (e.g. the build isn't installed) or names no entry,
 *   or the entry fails to load
 */
export const loadManifestEntry = async (manifestUrl: string): Promise<unknown> => {
  const url = new URL(manifestUrl, document.baseURI);
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`${url.href}: ${response.status} ${response.statusText}`);
  }

  const manifest: unknown = await response.json();

  if (!hasEntry(manifest)) {
    throw new Error(`${url.href} names no entry.`);
  }

  return import(/* @vite-ignore */ new URL(manifest.entry, url).href);
};

const hasEntry = (manifest: unknown): manifest is { entry: string } =>
  typeof manifest === "object" &&
  manifest !== null &&
  "entry" in manifest &&
  typeof manifest.entry === "string" &&
  manifest.entry !== "";
