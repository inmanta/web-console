const ANCHOR = "/console";

export class BaseUrlFinder {
  getUrl(url: string): string {
    if (!url.includes(ANCHOR)) return ANCHOR;
    if (url.split(ANCHOR).length > 2) return ANCHOR;
    const [firstPart] = url.split("/console");
    return `${firstPart}${ANCHOR}`;
  }
}
