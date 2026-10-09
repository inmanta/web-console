import React, { useState } from "react";
import { InstanceLog } from "@/Core/Domain/HistoryLog";
import {
  useGetInstanceLog,
  useGetInstanceLogs,
  useGetModelVersionForInstance,
} from "@/Data/Queries";
import { words } from "@/UI/words";
import { VersionSelectNotice, VersionSelectOption, VersionSelect } from "./VersionSelect";
import { ResourceActionInstance } from "./types";
import { useVersionSearch } from "./useVersionSearch";

/**
 * Turns an instance version into a select option, with its state rendered the way the instance's
 * own page shows it.
 *
 * @example toInstanceOption({ version: 4, timestamp: "...", state: "up", ... }, renderState) // { version: 4, date: "...", status: renderState("up") }
 */
const toInstanceOption = (
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
  onPick: (version: number) => void;
  lockReason: string | undefined;
}

/**
 * The instance version select of the dry-run dialog. It lists the instance's latest versions,
 * loads older ones as the list is scrolled, and finds any other by its number. Until a pick, it
 * shows the newest version. The shown version also says which model version it maps to, and
 * warns when it never got one.
 *
 * @Props {Props} - The props of the component
 *  @prop {string} id - The select's id, for the form label to point at
 *  @prop {ResourceActionInstance} instance - The instance whose versions to list
 *  @prop {(version: number) => void} onPick - Called with the picked instance version
 *  @prop {string | undefined} lockReason - When set, keeps the select on the newest version and shows this as the reason
 *
 * @returns {React.FC<Props>} The instance version select
 */
export const InstanceVersionSelect: React.FC<Props> = ({ id, instance, onPick, lockReason }) => {
  const [picked, setPicked] = useState<VersionSelectOption>();
  const toOption = (log: InstanceLog) => toInstanceOption(log, instance.renderState);

  const versions = useGetInstanceLogs(instance.serviceEntity, instance.id).useOneTime();
  const loaded = versions.data?.map(toOption) ?? [];
  const versionSearch = useVersionSearch(loaded, versions);
  const lookup = useGetInstanceLog(
    instance.serviceEntity,
    instance.id,
    versionSearch.lookupVersion
  );
  const { options, isLoadingMore, listError } = versionSearch.match(
    lookup,
    lookup.data ? toOption(lookup.data) : undefined
  );

  // Before a pick, the select shows the newest version. A lock keeps it there.
  const newest = versions.data?.[0];
  const defaultOption = newest && toOption(newest);
  const shownVersion = lockReason ? defaultOption : (picked ?? defaultOption);

  // The shown version also says which model version it maps to. Only the shown one is resolved.
  const modelVersion = useGetModelVersionForInstance(instance.id, shownVersion?.version).data;
  const shown: VersionSelectOption | undefined =
    shownVersion && modelVersion !== undefined
      ? {
          ...shownVersion,
          detail:
            modelVersion === null
              ? words("resources.resourceActions.confirm.version.noModel")
              : words("resources.resourceActions.confirm.version.mapsTo")(String(modelVersion)),
        }
      : shownVersion;

  // The message under the select, the most important one first.
  const notice = (): VersionSelectNotice | undefined => {
    if (lockReason) {
      return { variant: "warning", text: lockReason };
    }
    if (versions.isError) {
      return { variant: "error", text: words("resources.resourceActions.confirm.version.error") };
    }
    if (shown && modelVersion === null) {
      // A picked version is pinned and can't run; the default falls back to the latest release.
      return picked
        ? {
            variant: "error",
            text: words("resources.resourceActions.confirm.version.unexported")(
              String(shown.version)
            ),
          }
        : {
            variant: "warning",
            text: words("resources.resourceActions.confirm.version.unexported.default")(
              String(shown.version)
            ),
          };
    }

    return undefined;
  };

  const pick = (option: VersionSelectOption) => {
    setPicked(option);
    versionSearch.setSearch("");
    onPick(option.version);
  };

  return (
    <VersionSelect
      id={id}
      options={options}
      shown={shown}
      format={words("resources.resourceActions.confirm.version.instanceOption")}
      onSelect={pick}
      search={versionSearch.search}
      onSearchChange={versionSearch.setSearch}
      onReachEnd={versionSearch.loadMore}
      isLoadingMore={isLoadingMore}
      listError={listError}
      isDisabled={Boolean(lockReason)}
      isLoading={versions.isLoading}
      notice={notice()}
    />
  );
};
