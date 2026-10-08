import React, { useState } from "react";
import {
  Content,
  Flex,
  FlexItem,
  FormGroup,
  FormGroupLabelHelp,
  Popover,
  ToggleGroup,
  ToggleGroupItem,
} from "@patternfly/react-core";
import { InstanceLog } from "@/Core/Domain/HistoryLog";
import {
  VersionPin,
  useGetDesiredStateVersion,
  useGetDesiredStateVersions,
  useGetInstanceModelVersion,
  useGetInstanceVersion,
  useGetInstanceVersions,
} from "@/Data/Queries";
import { DesiredStateStatusLabel } from "@/UI/Components/DesiredStateStatusLabel";
import { useDebounce } from "@/UI/Utils";
import { words } from "@/UI/words";
import { DesiredStateVersion, DesiredStateVersionStatus } from "@S/DesiredState/Core/Domain";
import { VersionNotice, VersionOption, VersionSelect } from "./VersionSelect";

/**
 * The service instance the actions run on. The dialogs name it, and a dry run can pick one of its
 * own versions next to the model versions, with each state shown the way the page shows it.
 */
export interface ResourceActionInstance {
  id: string;
  serviceEntity: string;
  name: string;
  renderState: (state: string) => React.ReactNode;
}

type Lens = VersionPin["field"];

/**
 * The id of the version select, which the form label points at.
 */
const FIELD_ID = "dry-run-version";

/**
 * The searched version number, or undefined when the search text is not a whole number.
 *
 * @example toSearchedVersion(" 42 ") // 42
 */
const toSearchedVersion = (search: string): number | undefined =>
  /^\d+$/.test(search.trim()) ? Number(search.trim()) : undefined;

/**
 * Turns a desired state version into a select option.
 *
 * @example toModelOption({ version: 8, date: "...", status: "active", ... }) // { version: 8, date: "...", status: <DesiredStateStatusLabel /> }
 */
const toModelOption = (version: DesiredStateVersion): VersionOption => ({
  version: Number(version.version),
  date: version.date,
  status: <DesiredStateStatusLabel status={version.status} />,
});

interface Props {
  instance: ResourceActionInstance | undefined;
  onSelect: (pin: VersionPin | undefined) => void;
  lockReason: string | undefined;
}

/**
 * The version picker of the dry-run dialog. With an instance it offers two lenses on the same
 * intent, the instance's own versions (the default) or the model versions; otherwise only the
 * model versions. It lists the latest versions, loads older ones as the list is scrolled, narrows
 * them to the typed digits and looks up any other version by its full number. Until the user
 * picks one, it shows the version the dry run runs against by default. For an instance version it
 * also shows the model version behind it.
 *
 * @Props {Props} - The props of the component
 *  @prop {ResourceActionInstance | undefined} instance - The instance whose versions to offer, if any
 *  @prop {(pin: VersionPin | undefined) => void} onSelect - Called with the picked version, or undefined when the lens changes
 *  @prop {string | undefined} lockReason - When set, keeps the picker on the default version and shows this as the reason
 *
 * @returns {React.FC<Props>} The version form group
 */
export const DryRunVersionField: React.FC<Props> = ({ instance, onSelect, lockReason }) => {
  // What the user chose: the lens, a picked version and the search text.
  const [lens, setLens] = useState<Lens>(instance ? "instanceVersion" : "modelVersion");
  const [picked, setPicked] = useState<VersionOption>();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const typedVersion = toSearchedVersion(search);
  const isInstanceLens = instance !== undefined && lens === "instanceVersion";

  // An instance version as an option, with its state shown the way the instance page shows it.
  const toInstanceOption = (log: InstanceLog): VersionOption => ({
    version: Number(log.version),
    date: log.timestamp,
    status: instance?.renderState(log.state),
  });

  // The latest versions of both lenses, fetched up front so switching lenses doesn't wait.
  const latestModels = useGetDesiredStateVersions();
  const latestInstanceVersions = useGetInstanceVersions(instance);
  const latest = isInstanceLens ? latestInstanceVersions : latestModels;
  const loaded =
    (isInstanceLens
      ? latestInstanceVersions.data?.map(toInstanceOption)
      : latestModels.data?.map(toModelOption)) ?? [];
  const isLoaded = (version: number) => loaded.some((option) => option.version === version);

  // A typed number that isn't loaded is looked up on its own, once typing pauses.
  const debouncedVersion = toSearchedVersion(debouncedSearch);
  const lookupVersion =
    debouncedVersion !== undefined && !isLoaded(debouncedVersion) ? debouncedVersion : undefined;
  const lookedUpModel = useGetDesiredStateVersion(isInstanceLens ? undefined : lookupVersion);
  const lookedUpInstanceVersion = useGetInstanceVersion(
    instance,
    isInstanceLens ? lookupVersion : undefined
  );
  const lookup = isInstanceLens ? lookedUpInstanceVersion : lookedUpModel;
  const found = isInstanceLens
    ? lookedUpInstanceVersion.data && toInstanceOption(lookedUpInstanceVersion.data)
    : lookedUpModel.data && toModelOption(lookedUpModel.data);

  // The lookup is still on its way while typing hasn't paused or its request is running.
  const isLookupPending =
    typedVersion !== undefined &&
    !isLoaded(typedVersion) &&
    (typedVersion !== debouncedVersion || lookup.isLoading);
  const lookupError =
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
  const options = matching();

  // Scrolling to the end of the list loads the next page of the lens in use.
  const loadMore = () => {
    if (latest.hasNextPage && !latest.isFetchingNextPage) {
      latest.fetchNextPage();
    }
  };

  // Before a pick, the field shows the default: the active model version or the newest instance
  // version. A lock keeps it on that default.
  const activeModel = latestModels.data?.find(
    (version) => version.status === DesiredStateVersionStatus.active
  );
  const newestInstanceVersion = latestInstanceVersions.data?.[0];
  const defaultOption = isInstanceLens
    ? newestInstanceVersion && toInstanceOption(newestInstanceVersion)
    : activeModel && toModelOption(activeModel);
  const shownVersion = lockReason ? defaultOption : (picked ?? defaultOption);

  // An instance version also shows the model version it maps to. Only the shown one is resolved.
  const shownModelVersion = useGetInstanceModelVersion(
    instance?.id,
    isInstanceLens ? shownVersion?.version : undefined
  ).data;
  const shown: VersionOption | undefined =
    shownVersion && isInstanceLens && shownModelVersion !== undefined
      ? {
          ...shownVersion,
          detail:
            shownModelVersion === null
              ? words("resources.resourceActions.confirm.version.noModel")
              : words("resources.resourceActions.confirm.version.mapsTo")(
                  String(shownModelVersion)
                ),
        }
      : shownVersion;

  // The message under the field, the most important one first.
  const notice = (): VersionNotice | undefined => {
    if (lockReason) {
      return { variant: "warning", text: lockReason };
    }
    if (latestModels.isError || latestInstanceVersions.isError) {
      return { variant: "error", text: words("resources.resourceActions.confirm.version.error") };
    }
    if (shown && isInstanceLens && shownModelVersion === null) {
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

  // Picking pins that version. Switching lenses starts over from the default.
  const pick = (option: VersionOption) => {
    setPicked(option);
    setSearch("");
    onSelect({ field: lens, version: option.version });
  };

  const switchLens = (next: Lens) => {
    setLens(next);
    setPicked(undefined);
    setSearch("");
    onSelect(undefined);
  };

  const help = isInstanceLens
    ? words("resources.resourceActions.confirm.version.instance.helper")
    : words("resources.resourceActions.confirm.version.helper");

  return (
    <FormGroup
      label={words("resources.resourceActions.confirm.version.title")}
      fieldId={FIELD_ID}
      labelHelp={
        <Popover
          bodyContent={
            <Content component="p">
              {help} {words("resources.resourceActions.confirm.version.searchHint")}
            </Content>
          }
          position="right"
        >
          <FormGroupLabelHelp
            aria-label={words("resources.resourceActions.confirm.version.help")}
          />
        </Popover>
      }
    >
      <Flex direction={{ default: "column" }} gap={{ default: "gapSm" }}>
        {instance && (
          <ToggleGroup aria-label={words("resources.resourceActions.confirm.version.title")}>
            <ToggleGroupItem
              text={words("resources.resourceActions.confirm.version.lens.instance")}
              isSelected={lens === "instanceVersion"}
              isDisabled={Boolean(lockReason)}
              onChange={() => switchLens("instanceVersion")}
            />
            <ToggleGroupItem
              text={words("resources.resourceActions.confirm.version.lens.model")}
              isSelected={lens === "modelVersion"}
              isDisabled={Boolean(lockReason)}
              onChange={() => switchLens("modelVersion")}
            />
          </ToggleGroup>
        )}
        {/* One item for the select and its notice, so the gap above doesn't push the notice away
            from the select. */}
        <FlexItem>
          {/* One select for both lenses, so switching swaps its options instead of remounting it. */}
          <VersionSelect
            id={FIELD_ID}
            options={options}
            shown={shown}
            format={
              isInstanceLens
                ? words("resources.resourceActions.confirm.version.instanceOption")
                : words("resources.resourceActions.confirm.version.option")
            }
            onSelect={pick}
            search={search}
            onSearchChange={setSearch}
            onReachEnd={loadMore}
            isLoadingMore={latest.isFetchingNextPage || isLookupPending}
            listError={lookupError}
            isDisabled={Boolean(lockReason)}
            isLoading={latest.isLoading}
            notice={notice()}
          />
        </FlexItem>
      </Flex>
    </FormGroup>
  );
};
