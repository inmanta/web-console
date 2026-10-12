import React, { useState } from "react";
import { InstanceLog } from "@/Core/Domain/HistoryLog";
import {
  useGetInstanceLog,
  useGetInstanceLogs,
  useGetModelVersionForInstanceVersion,
} from "@/Data/Queries";
import { words } from "@/UI/words";
import { VersionSelectNotice, VersionSelectOption, VersionSelect } from "./VersionSelect";
import { ResourceActionInstance } from "./types";
import { useVersionSearch } from "./useVersionSearch";

/**
 * Turns an instance version into a select option, with its state rendered the way the instance's
 * own page shows it.
 *
 * @example toInstanceVersionOption({ version: 4, timestamp: "...", state: "up", ... }, renderState) // { version: 4, date: "...", status: renderState("up") }
 */
const toInstanceVersionOption = (
  log: InstanceLog,
  renderState: ResourceActionInstance["renderState"]
): VersionSelectOption => ({
  version: Number(log.version),
  date: log.timestamp,
  status: renderState(log.state),
});

interface Props {
  id: string;
  instance: ResourceActionInstance;
  onSelect: (instanceVersion: number) => void;
  blockedMessage: string | undefined;
}

/**
 * The instance version select of the dry-run dialog. It lists the instance's newest versions,
 * loads older ones as the list is scrolled, and finds any other by its number. Until a version is
 * selected, it shows the newest one. The shown version also says which model version it maps to,
 * and warns when it has no model version.
 *
 * @Props {Props} - The props of the component
 *  @prop {string} id - The select's id, for the form label to point at
 *  @prop {ResourceActionInstance} instance - The instance whose versions to list
 *  @prop {(instanceVersion: number) => void} onSelect - Called with the selected instance version
 *  @prop {string | undefined} blockedMessage - When set, selecting a version is blocked: the select stays on the newest version and shows this as the reason
 *
 * @returns {React.FC<Props>} The instance version select
 */
export const InstanceVersionSelect: React.FC<Props> = ({
  id,
  instance,
  onSelect,
  blockedMessage,
}) => {
  const [selectedOption, setSelectedOption] = useState<VersionSelectOption>();
  const toOption = (log: InstanceLog) => toInstanceVersionOption(log, instance.renderState);

  const instanceLogsQuery = useGetInstanceLogs(instance.serviceEntity, instance.id).useOneTime();
  const loadedOptions = instanceLogsQuery.data?.map(toOption) ?? [];
  const versionSearch = useVersionSearch(loadedOptions, instanceLogsQuery);
  const searchedVersionLookup = useGetInstanceLog(
    instance.serviceEntity,
    instance.id,
    versionSearch.versionToLookUp
  );
  const { options, isLoadingMore, listError } = versionSearch.getListState(
    searchedVersionLookup,
    searchedVersionLookup.data ? toOption(searchedVersionLookup.data) : undefined
  );

  // Until a version is selected, the select shows the newest one. A blocked selection keeps it
  // there.
  const newestInstanceLog = instanceLogsQuery.data?.[0];
  const defaultOption = newestInstanceLog && toOption(newestInstanceLog);
  const shownOption = blockedMessage ? defaultOption : (selectedOption ?? defaultOption);

  // The shown version also says which model version it maps to. Only the shown one is resolved.
  const modelVersionOfShownOption = useGetModelVersionForInstanceVersion(
    instance.id,
    shownOption?.version
  ).data;
  const shownOptionWithModelVersion: VersionSelectOption | undefined =
    shownOption && modelVersionOfShownOption !== undefined
      ? {
          ...shownOption,
          detail:
            modelVersionOfShownOption === null
              ? words("resources.resourceActions.confirm.version.mapsTo.none")
              : words("resources.resourceActions.confirm.version.mapsTo")(
                  String(modelVersionOfShownOption)
                ),
        }
      : shownOption;

  // The message under the select, the most important one first.
  const notice = (): VersionSelectNotice | undefined => {
    if (blockedMessage) {
      return { variant: "warning", text: blockedMessage };
    }
    if (instanceLogsQuery.isError) {
      return {
        variant: "error",
        text: words("resources.resourceActions.confirm.version.loadError"),
      };
    }
    if (shownOption && modelVersionOfShownOption === null) {
      // A selected instance version without a model version can't be dry-run; the default falls
      // back to the active model version.
      return selectedOption
        ? {
            variant: "error",
            text: words("resources.resourceActions.confirm.version.noModelVersion.selected")(
              String(shownOption.version)
            ),
          }
        : {
            variant: "warning",
            text: words("resources.resourceActions.confirm.version.noModelVersion.default")(
              String(shownOption.version)
            ),
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
      shownOption={shownOptionWithModelVersion}
      formatVersion={words("resources.resourceActions.confirm.version.instanceOption")}
      onSelect={selectOption}
      search={versionSearch.search}
      onSearchChange={versionSearch.setSearch}
      onReachEnd={versionSearch.loadMore}
      isLoadingMore={isLoadingMore}
      listError={listError}
      isDisabled={Boolean(blockedMessage)}
      isLoading={instanceLogsQuery.isLoading}
      notice={notice()}
    />
  );
};
