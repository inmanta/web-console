import React from "react";
import { words } from "@inmanta/web-console-core";
import { DesiredStateVersion } from "@inmanta/web-console-core/Domain/DesiredStateVersion";
import { useGetDesiredStateVersion } from "@inmanta/web-console-core/Queries/Slices/DesiredState";
import {
  VersionSelect,
  VersionSelectOption,
  createModelVersionOption,
  useModelVersionOptions,
} from "@inmanta/web-console-ui/Components/VersionSelect";

interface Props {
  id: string;
  label: string;
  modelVersion: number;
  isModelVersionDisabled: (modelVersion: number) => boolean;
  onSelect: (modelVersion: number) => void;
}

/**
 * One side of the Desired State Compare header: a select of model versions that shows the side's
 * model version from the URL. It lists the newest model versions, loads older ones as the list is
 * scrolled, and finds any other by its number. When the list fails to load, the toggle still shows
 * the model version and the open menu says the list couldn't be loaded.
 *
 * @props {Props} props - The component props
 *  @prop {string} id - The toggle's id
 *  @prop {string} label - The name of the select, e.g. "From version"
 *  @prop {number} modelVersion - The model version this side of the diff shows
 *  @prop {(modelVersion: number) => boolean} isModelVersionDisabled - Whether a listed model version can't be selected on this side
 *  @prop {(modelVersion: number) => void} onSelect - Called with the selected model version, unless it is the one already shown
 *
 * @returns {React.FC<Props>} The model version select of one side of the diff
 */
export const CompareModelVersionSelect: React.FC<Props> = ({
  id,
  label,
  modelVersion,
  isModelVersionDisabled,
  onSelect,
}) => {
  const createOption = (listedModelVersion: DesiredStateVersion): VersionSelectOption => ({
    ...createModelVersionOption(listedModelVersion),
    isDisabled: isModelVersionDisabled(Number(listedModelVersion.version)),
  });

  const { modelVersionsQuery, versionSearch, options, isLoadingMore, listError } =
    useModelVersionOptions(createOption);

  // The shown model version is looked up on its own when it isn't among the loaded ones, also when
  // the list failed to load, so the toggle still names it.
  const loadedShownModelVersion = modelVersionsQuery.data?.find(
    (listedModelVersion) => Number(listedModelVersion.version) === modelVersion
  );
  const shownModelVersionLookup = useGetDesiredStateVersion(
    !modelVersionsQuery.isPending && !loadedShownModelVersion ? modelVersion : undefined
  );
  const shownModelVersion = loadedShownModelVersion ?? shownModelVersionLookup.data;

  const selectOption = (option: VersionSelectOption) => {
    versionSearch.setSearch("");

    if (option.version !== modelVersion) {
      onSelect(option.version);
    }
  };

  return (
    <VersionSelect
      id={id}
      label={label}
      options={options}
      shownOption={shownModelVersion ? createModelVersionOption(shownModelVersion) : undefined}
      formatVersion={words("modelVersion")}
      onSelect={selectOption}
      search={versionSearch.search}
      onSearchChange={versionSearch.setSearch}
      onReachEnd={versionSearch.loadMore}
      isLoadingMore={isLoadingMore}
      listError={
        modelVersionsQuery.isError
          ? words("desiredState.compare.modelVersionsLoadError")
          : listError
      }
      isDisabled={false}
      isLoading={modelVersionsQuery.isLoading || shownModelVersionLookup.isLoading}
      notice={undefined}
    />
  );
};
