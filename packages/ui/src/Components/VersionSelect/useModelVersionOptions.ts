import { DesiredStateVersion } from "@inmanta/web-console-core/Domain/DesiredStateVersion";
import {
  useGetDesiredStateVersion,
  useGetDesiredStateVersions,
} from "@inmanta/web-console-core/Queries/Slices/DesiredState";
import { VersionSelectOption } from "./VersionSelect";
import { VersionSearch, useVersionSearch } from "./useVersionSearch";

/**
 * What a model version select lists, with the queries and search behind it.
 */
interface ModelVersionOptions {
  /** The paged list of model versions, newest first. */
  modelVersionsQuery: ReturnType<typeof useGetDesiredStateVersions>;

  /** The search text of the select, and loading the next page of the list. */
  versionSearch: VersionSearch;

  /** The loaded model versions that match the search, plus a looked-up one that isn't loaded. */
  options: VersionSelectOption[];

  /** Whether the next page or a looked-up model version is loading. */
  isLoadingMore: boolean;

  /** Why the searched model version couldn't be looked up, if it couldn't. */
  listError: string | undefined;
}

/**
 * React hook listing the model versions for a version select. It loads them a page at a time,
 * narrows them with the select's search, and looks up a searched model version that isn't loaded.
 * createOption turns each model version into an option, so a select can add its own details.
 *
 * @example
 * const { options, versionSearch } = useModelVersionOptions(createModelVersionOption);
 * versionSearch.setSearch("8"); // options becomes the model versions starting with 8
 */
export const useModelVersionOptions = (
  createOption: (modelVersion: DesiredStateVersion) => VersionSelectOption
): ModelVersionOptions => {
  const modelVersionsQuery = useGetDesiredStateVersions();
  const loadedOptions = modelVersionsQuery.data?.map(createOption) ?? [];
  const versionSearch = useVersionSearch(loadedOptions, modelVersionsQuery);
  const searchedVersionLookup = useGetDesiredStateVersion(versionSearch.versionToLookUp);
  const { options, isLoadingMore, listError } = versionSearch.getListState(
    searchedVersionLookup,
    searchedVersionLookup.data ? createOption(searchedVersionLookup.data) : undefined
  );

  return { modelVersionsQuery, versionSearch, options, isLoadingMore, listError };
};
