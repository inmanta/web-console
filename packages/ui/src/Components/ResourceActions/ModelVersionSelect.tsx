import React, { useState } from "react";
import { words } from "@inmanta/web-console-core";
import { DesiredStateVersionStatus } from "@inmanta/web-console-core/Domain/DesiredStateVersion";
import {
  VersionSelect,
  VersionSelectNotice,
  VersionSelectOption,
  createModelVersionOption,
  useModelVersionOptions,
} from "@inmanta/web-console-ui/Components/VersionSelect";

interface Props {
  id: string;
  label: string;
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
 *  @prop {string} label - The name of the select, e.g. "Against version"
 *  @prop {(modelVersion: number) => void} onSelect - Called with the selected model version
 *  @prop {string | undefined} blockedMessage - When set, selecting a version is blocked: the select stays on the active model version and shows this as the reason
 *
 * @returns {React.FC<Props>} The model version select
 */
export const ModelVersionSelect: React.FC<Props> = ({ id, label, onSelect, blockedMessage }) => {
  const [selectedOption, setSelectedOption] = useState<VersionSelectOption>();

  const { modelVersionsQuery, versionSearch, options, isLoadingMore, listError } =
    useModelVersionOptions(createModelVersionOption);

  // Until a version is selected, the select shows the active one. A blocked selection keeps it
  // there.
  const activeModelVersion = modelVersionsQuery.data?.find(
    (modelVersion) => modelVersion.status === DesiredStateVersionStatus.active
  );
  const defaultOption = activeModelVersion && createModelVersionOption(activeModelVersion);
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
      label={label}
      options={options}
      shownOption={shownOption}
      formatVersion={words("modelVersion")}
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
