import { Content, Flex, FlexItem, Popover } from "@patternfly/react-core";
import { Resource } from "@/Core";
import { words } from "@/UI";
import { LegendBar } from "../LegendBar";
import { colorConfig, statusGroupIcons, statusMapping, statusPriority } from "./config";

/** Height of every legend bar segment, shared by the empty and filled states and the skeleton so they stay aligned. */
export const BAR_ITEM_HEIGHT = "20px";

/** Checks whether a status filter value is one of the compound states shown in the bars. */
const isCompoundStateKey = (status: string): status is Resource.CompoundStateKey =>
  status in Resource.LAST_HANDLER_RUN ||
  status in Resource.COMPLIANCE ||
  status in Resource.BLOCKED;

/** Type guard for Object.entries results on a compound state record.
 * Narrows [string, unknown] to [Resource.CompoundStateKey, number]. */
const isCompoundStatusEntry = (
  entry: [string, unknown]
): entry is [Resource.CompoundStateKey, number] => {
  return isCompoundStateKey(entry[0]) && typeof entry[1] === "number";
};

/** Props for CompoundResourceStatus. `activeStatuses` is the status filter that is currently applied. */
interface CompoundResourceProps {
  resourceSummary: Resource.ResourceSummary;
  activeStatuses: string[];
  updateFilter: (updater: (filter: Resource.Filter) => Resource.Filter) => void;
}

/**
 * Displays a color-coded legend bar for each resource compound state.
 * Clicking a segment toggles that status in the filter. While any of these statuses is filtered,
 * every segment outside the filter fades, across all bars. Shows a gray bar when empty.
 *
 * @props {CompoundResourceProps} props - The props of the component.
 *  @prop {Resource.resourceSummary} resourceSummary - Status counts grouped by state.
 *  @prop {string[]} activeStatuses - The status filter that is currently applied.
 *  @prop {Function} updateFilter - Updates the active resource filter.
 *
 * @returns {React.FC<CompoundResourceProps>} A legend bar for each compound state.
 */

export const CompoundResourceStatus = ({
  resourceSummary: { totalCount, blocked, compliance, lastHandlerRun },
  activeStatuses,
  updateFilter,
}: CompoundResourceProps) => {
  const compoundState: Resource.CompoundStateSummary = { blocked, compliance, lastHandlerRun };
  const hasActiveState = activeStatuses.some(isCompoundStateKey);

  const compoundStateEntries = Object.entries(compoundState) as [
    keyof Resource.CompoundStateSummary,
    Partial<Record<Resource.CompoundStateKey, number>>,
  ][];

  const onClick = (state: Resource.CompoundStateKey) => {
    updateFilter((filter) => {
      const current = filter.status ?? [];

      if (current.includes(state)) {
        return { ...filter, status: current.filter((status) => status !== state) };
      }

      return {
        ...filter,
        status: [...current.filter((status) => status !== `!${state}`), state],
      };
    });
  };

  /** Converts a status record into an array of items consumable by LegendBar. */
  const toLegendBarItems = (record: Partial<Record<Resource.CompoundStateKey, number>>) => {
    if (!totalCount) {
      return [
        {
          id: "empty",
          value: 0,
          backgroundColor: "var(--pf-t--color--gray--30)",
          isEmpty: true,
          height: BAR_ITEM_HEIGHT,
          label: words("resources.empty.message"),
        },
      ];
    }

    const items = Object.entries(record)
      .filter(isCompoundStatusEntry)
      .filter(([, value]) => value > 0)
      .sort(([a], [b]) => statusPriority[a] - statusPriority[b])
      .map(([status, value]) => ({
        id: status,
        value,
        backgroundColor: colorConfig[status],
        label: statusMapping[status.toUpperCase()],
        height: BAR_ITEM_HEIGHT,
        isActive: activeStatuses.includes(status),
        isDimmed: hasActiveState && !activeStatuses.includes(status),
        onClick,
      }));

    return items;
  };

  return (
    <Flex direction={{ default: "column" }} gap={{ default: "gapSm" }} flex={{ default: "flex_1" }}>
      {compoundStateEntries.map(([key, record]) => (
        <Flex key={key} flex={{ default: "flex_1" }} alignItems={{ default: "alignItemsCenter" }}>
          <FlexItem style={{ display: "inline-flex" }}>
            <Popover
              bodyContent={
                <Content component="p">{words(`resources.status.label.${key}`)}</Content>
              }
              triggerAction="hover"
              position="left"
            >
              {statusGroupIcons[key]()}
            </Popover>
          </FlexItem>
          <FlexItem flex={{ default: "flex_1" }}>
            <LegendBar
              data-testid={`legend-bar-${key}`}
              items={toLegendBarItems(record)}
              aria-label={words("resources.compoundStateSummary.title")}
            />
          </FlexItem>
        </Flex>
      ))}
    </Flex>
  );
};
