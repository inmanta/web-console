import { Flex, FlexItem } from "@patternfly/react-core";
import { Resource } from "@/Core";
import { words } from "@/UI";
import { LegendBar } from "../LegendBar";
import { colorConfig, statusGroupIcons, statusPriority } from "./config";

/** Type guard for Object.entries results on a compound state record.
 * Narrows [string, unknown] to [Resource.CompoundStateType, number]. */
const isCompoundStatusEntry = (
  entry: [string, unknown]
): entry is [Resource.CompoundStateKey, number] => {
  return entry[0] in colorConfig && typeof entry[1] === "number";
};

interface CompoundResourceProps {
  resourceSummary: Resource.ResourceSummary;
  updateFilter: (updater: (filter: Resource.Filter) => Resource.Filter) => void;
}

/**
 * Displays a color-coded legend bar for each resource compound state.
 * Clicking a segment filters resources by that status. Shows a gray bar when empty.
 *
 * @props {CompoundResourceProps} props - The props of the component.
 *  @prop {Resource.resourceSummary} resourceSummary - Status counts grouped by state.
 *  @prop {Function} updateFilter - Updates the active resource filter.
 *
 * @returns {React.FC<CompoundResourceProps>} A legend bar for each compound state.
 */

export const CompoundResourceStatus = ({
  resourceSummary: { totalCount, blocked, compliance, lastHandlerRun },
  updateFilter,
}: CompoundResourceProps) => {
  const compoundState: Resource.CompoundStateSummary = { blocked, compliance, lastHandlerRun };

  const onClick = (state: Resource.CompoundStateKey) => {
    updateFilter((filter) => {
      const current = filter.status ?? [];

      if (current.includes(state)) {
        return filter;
      }

      return {
        ...filter,
        status: [...current, state],
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
        label: status,
        height: "20px",
        onClick,
      }));
    return items;
  };

  return (
    <Flex direction={{ default: "column" }} gap={{ default: "gapSm" }} flex={{ default: "flex_1" }}>
      {Object.entries(compoundState).map(([key, record]) => (
        <Flex key={key} flex={{ default: "flex_1" }} alignItems={{ default: "alignItemsCenter" }}>
          <FlexItem style={{ display: "inline-flex" }}>{statusGroupIcons[key]()}</FlexItem>
          <FlexItem flex={{ default: "flex_1" }}>
            <LegendBar
              data-testid={`legend-bar-${key}`}
              items={toLegendBarItems(record)}
              aria-label={words("resources.deploySummary.title")}
            />
          </FlexItem>
        </Flex>
      ))}
    </Flex>
  );
};
