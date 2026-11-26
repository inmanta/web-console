import { loadManifestEntry } from "./loadManifestEntry";

const respondWith = (response: Response) => {
  const fetchMock = vi.fn(() => Promise.resolve(response));

  vi.stubGlobal("fetch", fetchMock);

  return fetchMock;
};

describe("loadManifestEntry", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("GIVEN a manifest THEN it fetches it past the cache and imports the entry it names", async () => {
    const fetchMock = respondWith(
      Response.json({ entry: "data:text/javascript,export const feature = 'composer';" })
    );

    const entry = await loadManifestEntry("./composer-manifest.json");

    expect(entry).toMatchObject({ feature: "composer" });
    expect(fetchMock).toHaveBeenCalledWith(new URL("./composer-manifest.json", document.baseURI), {
      cache: "no-store",
    });
  });

  test("GIVEN no manifest THEN it rejects, so the app starts without the feature", async () => {
    respondWith(new Response(null, { status: 404, statusText: "Not Found" }));

    await expect(loadManifestEntry("./composer-manifest.json")).rejects.toThrow("404 Not Found");
  });

  test("GIVEN a manifest without an entry THEN it rejects", async () => {
    respondWith(Response.json({ version: "1.0.0" }));

    await expect(loadManifestEntry("./composer-manifest.json")).rejects.toThrow("names no entry");
  });
});
