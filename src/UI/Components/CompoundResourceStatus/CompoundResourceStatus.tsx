import { Flex, FlexItem } from "@patternfly/react-core";
import { Resource } from "@/Core";
import { words } from "@/UI";
import { LegendBar } from "../LegendBar";
import { colorConfig, statusGroupIcons, statusPriority } from "./config";

/** Type guard for Object.entries results on a compound state record.
 * Narrows [string, unknown] to [Resource.CompoundStateType, number]. */
const isCompoundStatusEntry = (
  entry: [string, unknown]
): entry is [Resource.CompoundStateType, number] => {
  return entry[0] in colorConfig && typeof entry[1] === "number";
};

export interface CompoundResourceProps {
  compoundState: Resource.CompoundState;
  totalCount: number;
  updateFilter: (updater: (filter: Resource.Filter) => Resource.Filter) => void;
}

/**
 * Displays a color-coded legend bar for each resource status category.
 * Clicking a segment filters resources by that status. Shows a gray bar when empty.
 *
 * @props {CompoundResourceProps} props - The props of the component.
 *  @prop {Resource.CompoundState} compoundState - Status counts grouped by status category.
 *  @prop {number} totalCount - Total resource count; triggers empty state when zero.
 *  @prop {Function} updateFilter - Updates the active resource filter.
 *
 * @returns {React.FC<CompoundResourceProps>} A legend bar for each compound state.
 */

export const CompoundResourceStatus = ({
  compoundState,
  totalCount,
  updateFilter,
}: CompoundResourceProps) => {
  const onClick = (id: Resource.CompoundStateType) => {
    return updateFilter((filter) => ({ ...filter, status: [id] }));
  };

  /** Converts a status record into an array of items consumable by LegendBar. */
  const toLegendBarItems = (record: Resource.StateRecord) => {
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
        onClick,
      }));
    return items;
  };

  return (
    <Flex direction={{ default: "column" }} gap={{ default: "gapSm" }} flex={{ default: "flex_1" }}>
      {Object.entries(compoundState).map(([key, record]) => (
        <Flex key={key} flex={{ default: "flex_1" }} alignItems={{ default: "alignItemsCenter" }}>
          <FlexItem>{statusGroupIcons[key]}</FlexItem>
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
