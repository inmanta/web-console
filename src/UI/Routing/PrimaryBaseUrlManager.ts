import { BaseUrlManager } from "@/Core";

export class PrimaryBaseUrlManager implements BaseUrlManager {
  private readonly anchor = "/console";

  constructor(
    private readonly origin: string,
    private readonly pathname: string
  ) {}

  getBasePathname(): string {
    const { pathname, anchor } = this;
    if (!pathname.includes(anchor)) return anchor;
    if (pathname.split(anchor).length > 2) return anchor;
    const [pre] = pathname.split(anchor);
    return `${pre}${anchor}`;
  }

  getBaseUrl(forcedUrl?: string): string {
    const { anchor, origin } = this;
    const basePathname = this.getBasePathname().replace(anchor, "");
    return forcedUrl || `${origin}${basePathname}`;
  }
}
