import { matchPath } from "react-router-dom";
import { Maybe, isNotNull } from "@/Core";
import { paths } from "./Paths";

type MatchedParams = Record<string, string>;

export class BaseUrlFinder {
  getUrl(url: string): string {
    const result = this.find(url);
    if (Maybe.isNone(result)) return this.santitizeUrl(url);
    return result.value;
  }

  find(fullUrl: string): Maybe.Type<string> {
    const matches = this.getPaths().map((path) =>
      matchPath<MatchedParams>(fullUrl, { path, exact: true })
    );
    const hits = matches.filter(isNotNull);
    if (hits.length <= 0) return Maybe.none();
    return Maybe.some(hits[0].params[0]);
  }

  getPaths(): string[] {
    return [...Object.values(paths).map((path) => `*${path}`)];
  }

  santitizeUrl(url: string): string {
    return url.endsWith("/") ? url.substring(0, url.length - 1) : url;
  }
}
