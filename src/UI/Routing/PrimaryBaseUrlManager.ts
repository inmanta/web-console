import { BaseUrlManager } from "@/Core";

export class PrimaryBaseUrlManager implements BaseUrlManager {
  private readonly ANCHOR = "/console";

  constructor(private readonly url: string) {}

  getConsoleBaseUrl(): string {
    const { ANCHOR, url } = this;
    if (!url.includes(ANCHOR)) return ANCHOR;
    if (url.split(ANCHOR).length > 2) return ANCHOR;
    const [pre] = this.url.split(ANCHOR);
    return `${pre}${ANCHOR}`;
  }

  getBaseUrl(forcedUrl?: string): string {
    return forcedUrl || this.getConsoleBaseUrl().replace(this.ANCHOR, "");
  }
}
