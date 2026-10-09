import React, { useState } from "react";
import { useGetDesiredStateVersion, useGetDesiredStateVersions } from "@/Data/Queries";
import { DesiredStateStatusLabel } from "@/UI/Components/DesiredStateStatusLabel";
import { words } from "@/UI/words";
import { DesiredStateVersion, DesiredStateVersionStatus } from "@S/DesiredState/Core/Domain";
import { VersionSelectNotice, VersionSelectOption, VersionSelect } from "./VersionSelect";
import { useVersionSearch } from "./useVersionSearch";

/**
 * Turns a model version from the desired state endpoint into a select option.
 *
 * @example toModelVersionOption({ version: 8, date: "...", status: "active", ... }) // { version: 8, date: "...", status: <DesiredStateStatusLabel /> }
 */
const toModelVersionOption = (modelVersion: DesiredStateVersion): VersionSelectOption => ({
  version: Number(modelVersion.version),
  date: modelVersion.date,
  status: <DesiredStateStatusLabel status={modelVersion.status} />,
});

interface Props {
  id: string;
  onSelect: (modelVersion: number) => void;
  blockedMessage: string | undefined;
}

/**
 * The model version select of the dry-run dialog. It lists the newest model versions, loads older
 * ones as the list is scrolled, and finds any other by its number. Until a version is selected, it
 * shows the active model version, which a dry run uses by default.
 *
 * @Props {Props} - The props of the component
 *  @prop {string} id - The select's id, for the form label to point at
 *  @prop {(modelVersion: number) => void} onSelect - Called with the selected model version
 *  @prop {string | undefined} blockedMessage - When set, selecting a version is blocked: the select stays on the active model version and shows this as the reason
 *
 * @returns {React.FC<Props>} The model version select
 */
export const ModelVersionSelect: React.FC<Props> = ({ id, onSelect, blockedMessage }) => {
  const [selectedOption, setSelectedOption] = useState<VersionSelectOption>();

  const modelVersionsQuery = useGetDesiredStateVersions();
  const loadedOptions = modelVersionsQuery.data?.map(toModelVersionOption) ?? [];
  const versionSearch = useVersionSearch(loadedOptions, modelVersionsQuery);
  const searchedVersionLookup = useGetDesiredStateVersion(versionSearch.versionToLookUp);
  const { options, isLoadingMore, listError } = versionSearch.getListState(
    searchedVersionLookup,
    searchedVersionLookup.data ? toModelVersionOption(searchedVersionLookup.data) : undefined
  );

  // Until a version is selected, the select shows the active one. A blocked selection keeps it
  // there.
  const activeModelVersion = modelVersionsQuery.data?.find(
    (modelVersion) => modelVersion.status === DesiredStateVersionStatus.active
  );
  const defaultOption = activeModelVersion && toModelVersionOption(activeModelVersion);
  const shownOption = blockedMessage ? defaultOption : (selectedOption ?? defaultOption);

  // The message under the select, the most important one first.
  const notice = (): VersionSelectNotice | undefined => {
    if (blockedMessage) {
      return { variant: "warning", text: blockedMessage };
    }
    if (modelVersionsQuery.isError) {
      return {
        variant: "error",
        text: words("resources.resourceActions.confirm.version.loadError"),
      };
    }

    return undefined;
  };

  const selectOption = (option: VersionSelectOption) => {
    setSelectedOption(option);
    versionSearch.setSearch("");
    onSelect(option.version);
  };

  return (
    <VersionSelect
      id={id}
      options={options}
      shownOption={shownOption}
      formatVersion={words("resources.resourceActions.confirm.version.modelOption")}
      onSelect={selectOption}
      search={versionSearch.search}
      onSearchChange={versionSearch.setSearch}
      onReachEnd={versionSearch.loadMore}
      isLoadingMore={isLoadingMore}
      listError={listError}
      isDisabled={Boolean(blockedMessage)}
      isLoading={modelVersionsQuery.isLoading}
      notice={notice()}
    />
  );
};
