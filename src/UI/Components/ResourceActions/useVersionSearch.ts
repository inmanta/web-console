import { useState } from "react";
import { useDebounce } from "@/UI/Utils";
import { words } from "@/UI/words";
import { VersionSelectOption } from "./VersionSelect";

/**
 * The searched version number, or undefined when the search text is not a whole number.
 *
 * @example toSearchedVersion(" 42 ") // 42
 */
const toSearchedVersion = (search: string): number | undefined =>
  /^\d+$/.test(search.trim()) ? Number(search.trim()) : undefined;

/**
 * The paged query that lists the versions, newest first.
 */
interface VersionList {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => unknown;
}

/**
 * The state of the query that looks up one version by its number.
 */
interface Lookup {
  isLoading: boolean;
  isError: boolean;
}

/**
 * The search of a version select. lookupVersion is the version to look up on its own, loadMore
 * loads the next page of the list, and match turns the lookup into the options to list, whether
 * more are loading, and the lookup's error.
 */
interface VersionSearch {
  search: string;
  setSearch: (search: string) => void;
  lookupVersion: number | undefined;
  loadMore: () => void;
  match: (
    lookup: Lookup,
    found: VersionSelectOption | undefined
  ) => {
    options: VersionSelectOption[];
    isLoadingMore: boolean;
    listError: string | undefined;
  };
}

/**
 * React hook holding the search of a version select. Typed digits narrow the loaded versions, and
 * a full number that isn't loaded is looked up on its own once typing pauses, by a query the
 * caller runs with lookupVersion. Scrolling to the end of the list loads its next page.
 *
 * @example
 * const versionSearch = useVersionSearch(loaded, versions);
 * const lookup = useGetDesiredStateVersion(versionSearch.lookupVersion);
 * versionSearch.match(lookup, found).options // the loaded versions starting with the typed digits, plus found
 */
export const useVersionSearch = (
  loaded: VersionSelectOption[],
  list: VersionList
): VersionSearch => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const typedVersion = toSearchedVersion(search);
  const debouncedVersion = toSearchedVersion(debouncedSearch);
  const isLoaded = (version: number) => loaded.some((option) => option.version === version);
  const lookupVersion =
    debouncedVersion !== undefined && !isLoaded(debouncedVersion) ? debouncedVersion : undefined;

  const loadMore = () => {
    if (list.hasNextPage && !list.isFetchingNextPage) {
      list.fetchNextPage();
    }
  };

  const match: VersionSearch["match"] = (lookup, found) => {
    // The lookup is still on its way while typing hasn't paused or its request is running.
    const isLookupPending =
      typedVersion !== undefined &&
      !isLoaded(typedVersion) &&
      (typedVersion !== debouncedVersion || lookup.isLoading);
    const listError =
      lookupVersion !== undefined && lookupVersion === typedVersion && lookup.isError
        ? words("resources.resourceActions.confirm.version.lookupError")(String(lookupVersion))
        : undefined;

    // The loaded versions starting with the typed digits, plus the looked-up one. The digits are
    // read as a number, so leading zeros are ignored.
    const matching = () => {
      if (search.trim() === "") {
        return loaded;
      }
      if (typedVersion === undefined) {
        return [];
      }

      return [...loaded, ...(found && !isLoaded(found.version) ? [found] : [])]
        .filter((option) => String(option.version).startsWith(String(typedVersion)))
        .sort((a, b) => b.version - a.version);
    };

    return {
      options: matching(),
      isLoadingMore: list.isFetchingNextPage || isLookupPending,
      listError,
    };
  };

  return { search, setSearch, lookupVersion, loadMore, match };
};
