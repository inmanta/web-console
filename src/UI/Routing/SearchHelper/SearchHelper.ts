import qs from "qs";
import { keepKeys } from "@/Core";

export class SearchHelper {
  /**
   * Clears the leading question mark character from the search string if present.
   */
  private clearQuestionMark(search: string): string {
    if (search.startsWith("?")) return search.slice(1);
    return search;
  }

  /**
   * Turn the search string into a search object.
   * The search string can have a leading question mark.
   */
  parse(search: string): Record<string, unknown> {
    return qs.parse(this.clearQuestionMark(search), {
      allowDots: true,
      arrayLimit: 200,
    });
  }

  /**
   * Turn the search object into a search string.
   * If there are search params, the search string will have a leading question mark.
   * If there are no search params, the search string will be empty.
   */
  stringify(value: Record<string, unknown>): string {
    const params = qs.stringify(value, {
      allowDots: true,
      encodeValuesOnly: true,
    });
    return params.length > 0 ? `?${params}` : "";
  }

  /**
   * Returns the search string with only an env key if present
   */
  keepEnvOnly(search: string): string {
    const parsedSearch = this.parse(search);
    return this.stringify(keepKeys(["env"], parsedSearch));
  }
}
