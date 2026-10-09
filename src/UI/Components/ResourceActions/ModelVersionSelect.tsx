import React, { useState } from "react";
import { useGetDesiredStateVersion, useGetDesiredStateVersions } from "@/Data/Queries";
import { DesiredStateStatusLabel } from "@/UI/Components/DesiredStateStatusLabel";
import { words } from "@/UI/words";
import { DesiredStateVersion, DesiredStateVersionStatus } from "@S/DesiredState/Core/Domain";
import { VersionSelectNotice, VersionSelectOption, VersionSelect } from "./VersionSelect";
import { useVersionSearch } from "./useVersionSearch";

/**
 * Turns a desired state version into a select option.
 *
 * @example toModelOption({ version: 8, date: "...", status: "active", ... }) // { version: 8, date: "...", status: <DesiredStateStatusLabel /> }
 */
const toModelOption = (version: DesiredStateVersion): VersionSelectOption => ({
  version: Number(version.version),
  date: version.date,
  status: <DesiredStateStatusLabel status={version.status} />,
});

interface Props {
  id: string;
  onPick: (version: number) => void;
  lockReason: string | undefined;
}

/**
 * The model version select of the dry-run dialog. It lists the latest model versions, loads older
 * ones as the list is scrolled, and finds any other by its number. Until a pick, it shows the
 * active version, which a dry run uses by default.
 *
 * @Props {Props} - The props of the component
 *  @prop {string} id - The select's id, for the form label to point at
 *  @prop {(version: number) => void} onPick - Called with the picked model version
 *  @prop {string | undefined} lockReason - When set, keeps the select on the active version and shows this as the reason
 *
 * @returns {React.FC<Props>} The model version select
 */
export const ModelVersionSelect: React.FC<Props> = ({ id, onPick, lockReason }) => {
  const [picked, setPicked] = useState<VersionSelectOption>();

  const versions = useGetDesiredStateVersions();
  const loaded = versions.data?.map(toModelOption) ?? [];
  const versionSearch = useVersionSearch(loaded, versions);
  const lookup = useGetDesiredStateVersion(versionSearch.lookupVersion);
  const { options, isLoadingMore, listError } = versionSearch.match(
    lookup,
    lookup.data ? toModelOption(lookup.data) : undefined
  );

  // Before a pick, the select shows the active version. A lock keeps it there.
  const active = versions.data?.find(
    (version) => version.status === DesiredStateVersionStatus.active
  );
  const defaultOption = active && toModelOption(active);
  const shown = lockReason ? defaultOption : (picked ?? defaultOption);

  // The message under the select, the most important one first.
  const notice = (): VersionSelectNotice | undefined => {
    if (lockReason) {
      return { variant: "warning", text: lockReason };
    }
    if (versions.isError) {
      return { variant: "error", text: words("resources.resourceActions.confirm.version.error") };
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
      format={words("resources.resourceActions.confirm.version.option")}
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
