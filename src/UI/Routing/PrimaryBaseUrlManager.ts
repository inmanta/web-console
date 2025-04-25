import { BaseUrlManager } from "@/Core";

export class PrimaryBaseUrlManager implements BaseUrlManager {
  private readonly anchor = "/console";

  constructor(
    private readonly origin: string,
    private readonly pathname: string
  ) {}

  getBasePathname(): string {
    const { anchor } = this;
    // Normalize the pathname by removing trailing slash
    const normalizedPathname = this.pathname.replace(/\/$/, "");

    if (!normalizedPathname.includes(anchor)) return anchor;
    if (normalizedPathname.split(anchor).length > 2) return anchor;

    const [pre] = normalizedPathname.split(anchor);
    return `${pre}${anchor}`;
  }

  getBaseUrl(forcedUrl?: string): string {
    const { anchor, origin } = this;
    const basePathname = this.getBasePathname().replace(anchor, "");

    return forcedUrl || `${origin}${basePathname}`;
  }
}
