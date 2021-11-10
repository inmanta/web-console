import { Location } from "history";
import qs from "qs";

export class SearchParamsManager {
  constructor(private readonly useLocation: () => Location) {}

  /**
   * Clears the leading question mark character from the search string if present.
   */
  private clearQuestionMark(search: string): string {
    if (search.startsWith("?")) return search.slice(1);
    return search;
  }

  private getParams(): Record<string, unknown> {
    const { search } = this.useLocation();
    return qs.parse(this.clearQuestionMark(search));
  }

  getEnvironment(): string | null {
    const { env } = this.getParams();
    return typeof env !== "undefined" ? (env as string) : null;
  }

  getSearchWithEnvironment(environment: string): string {
    const params = this.getParams();
    params.env = environment;
    return `?${qs.stringify(params)}`;
  }
}
