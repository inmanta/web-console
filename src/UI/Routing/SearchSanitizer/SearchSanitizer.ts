import { Kind } from "@/UI/Routing/Kind";
import { getKeysExcluding, isObject, keepKeys } from "@/Core";
import { PageStateSanitizer } from "@/UI/Routing/PageStateSanitizer";
import { SearchHelper } from "@/UI/Routing/SearchHelper";

/**
 * SearchSanitizer has utilities to sanitize the search string.
 * It will remove any illegal values.
 * Illegal values are values we don't recognize.
 * But also pageState of child pages we no longer need.
 */
export class SearchSanitizer {
  validKeys = ["env", "state"];
  searchHelper: SearchHelper;
  pageStateSanitizer: PageStateSanitizer;

  constructor() {
    this.searchHelper = new SearchHelper();
    this.pageStateSanitizer = new PageStateSanitizer();
  }

  /**
   * Sanitizes the search string.
   * This maintains the original order of the search params.
   */
  sanitize(routeKind: Kind, search: string): string {
    const parsedSearch = this.searchHelper.parse(search);
    const sanitizedSearch = keepKeys(this.validKeys, parsedSearch);
    const { state } = sanitizedSearch;
    if (typeof state === "undefined")
      return this.searchHelper.stringify(sanitizedSearch);
    if (!isObject(state)) {
      return this.searchHelper.stringify(keepKeys(["env"], sanitizedSearch));
    }
    return this.searchHelper.stringify(
      Object.assign(sanitizedSearch, {
        state: this.pageStateSanitizer.sanitize(routeKind, state),
      })
    );
  }

  /**
   * Checks if the search string contains illegal values.
   */
  isSanitized(routeKind: Kind, search: string): boolean {
    const parsedSearch = this.searchHelper.parse(search);
    if (getKeysExcluding(this.validKeys, parsedSearch).length > 0) return false;
    const { state } = parsedSearch;
    if (typeof state === "undefined") return true;
    if (!isObject(state)) return false;
    return this.pageStateSanitizer.isSanitized(routeKind, state);
  }
}
