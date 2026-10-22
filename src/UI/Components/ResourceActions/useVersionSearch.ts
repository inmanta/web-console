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
interface VersionListQuery {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => unknown;
}

/**
 * The state of the query that looks up the searched version by its number.
 */
interface LookupState {
  isLoading: boolean;
  isError: boolean;
}

/**
 * What the version select lists: the options, whether more are loading, and the lookup's error.
 */
interface ListState {
  options: VersionSelectOption[];
  isLoadingMore: boolean;
  listError: string | undefined;
}

/**
 * The search of a version select. versionToLookUp is the version to look up on its own, loadMore
 * loads the next page of the list, and getListState combines the loaded options with the lookup
 * into what the select lists.
 */
interface VersionSearch {
  search: string;
  setSearch: (search: string) => void;
  versionToLookUp: number | undefined;
  loadMore: () => void;
  getListState: (
    lookupState: LookupState,
    lookedUpOption: VersionSelectOption | undefined
  ) => ListState;
}

/**
 * React hook holding the search of a version select. Searched digits narrow the loaded versions,
 * and a full number that isn't loaded is looked up on its own once typing pauses, by a query the
 * caller runs with versionToLookUp. Scrolling to the end of the list loads its next page.
 *
 * @example
 * const versionSearch = useVersionSearch(loadedOptions, modelVersionsQuery);
 * const searchedVersionLookup = useGetDesiredStateVersion(versionSearch.versionToLookUp);
 * versionSearch.getListState(searchedVersionLookup, lookedUpOption).options // the loaded versions starting with the searched digits, plus lookedUpOption
 */
export const useVersionSearch = (
  loadedOptions: VersionSelectOption[],
  versionListQuery: VersionListQuery
): VersionSearch => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const searchedVersion = toSearchedVersion(search);
  const debouncedSearchedVersion = toSearchedVersion(debouncedSearch);
  const isLoaded = (version: number) => loadedOptions.some((option) => option.version === version);
  const versionToLookUp =
    debouncedSearchedVersion !== undefined && !isLoaded(debouncedSearchedVersion)
      ? debouncedSearchedVersion
      : undefined;

  const loadMore = () => {
    if (versionListQuery.hasNextPage && !versionListQuery.isFetchingNextPage) {
      versionListQuery.fetchNextPage();
    }
  };

  const getListState: VersionSearch["getListState"] = (lookupState, lookedUpOption) => {
    // The lookup is still on its way while typing hasn't paused or its request is running.
    const isLookupPending =
      searchedVersion !== undefined &&
      !isLoaded(searchedVersion) &&
      (searchedVersion !== debouncedSearchedVersion || lookupState.isLoading);
    const listError =
      versionToLookUp !== undefined && versionToLookUp === searchedVersion && lookupState.isError
        ? words("resources.resourceActions.confirm.version.lookupError")(String(versionToLookUp))
        : undefined;

    // The loaded versions starting with the searched digits, plus the looked-up one. The digits are
    // read as a number, so leading zeros are ignored.
    const matchingOptions = () => {
      if (search.trim() === "") {
        return loadedOptions;
      }
      if (searchedVersion === undefined) {
        return [];
      }

      return [
        ...loadedOptions,
        ...(lookedUpOption && !isLoaded(lookedUpOption.version) ? [lookedUpOption] : []),
      ]
        .filter((option) => String(option.version).startsWith(String(searchedVersion)))
        .sort((a, b) => b.version - a.version);
    };

    return {
      options: matchingOptions(),
      isLoadingMore: versionListQuery.isFetchingNextPage || isLookupPending,
      listError,
    };
  };

  return { search, setSearch, versionToLookUp, loadMore, getListState };
};
