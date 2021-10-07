import qs from "qs";
import { Kind } from "@/UI/Routing/Kind";
import { getKeysExcluding, isObject, keepKeys } from "@/Core";
import { PageStateSanitizer } from "../PageStateSanitizer";

/**
 * SearchSanitizer has utilities to sanitize the search string.
 * It will remove any illegal values.
 * Illegal values are values we don't recognize.
 * But also pageState of child pages we no longer need.
 */
export class SearchSanitizer {
  validKeys = ["env", "state"];

  constructor(private readonly pageStateSanitizer: PageStateSanitizer) {}

  /**
   * Sanitizes the search string.
   * This maintains the original order of the search params.
   */
  sanitize(routeKind: Kind, search: string): string {
    const parsedSearch = this.parse(search);
    const sanitizedSearch = keepKeys(this.validKeys, parsedSearch);
    const { state } = sanitizedSearch;
    if (typeof state === "undefined") return this.stringify(sanitizedSearch);
    if (!isObject(state)) {
      return this.stringify(keepKeys(["env"], sanitizedSearch));
    }
    return this.stringify(
      Object.assign(sanitizedSearch, {
        state: this.pageStateSanitizer.sanitize(routeKind, state),
      })
    );
  }

  /**
   * Checks if the search string contains illegal values.
   */
  isSanitized(routeKind: Kind, search: string): boolean {
    const parsedSearch = this.parse(search);
    if (getKeysExcluding(this.validKeys, parsedSearch).length > 0) return false;
    const { state } = parsedSearch;
    if (typeof state === "undefined") return true;
    if (!isObject(state)) return false;
    return this.pageStateSanitizer.isSanitized(routeKind, state);
  }

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
  private parse(search: string): Record<string, unknown> {
    return qs.parse(this.clearQuestionMark(search), { allowDots: true });
  }

  /**
   * Turn the search object into a search string.
   * If there are search params, the search string will have a leading question mark.
   * If there are no search params, the search string will be empty.
   */
  private stringify(value: Record<string, unknown>): string {
    const params = qs.stringify(value, { allowDots: true });
    return params.length > 0 ? `?${params}` : "";
  }
}
