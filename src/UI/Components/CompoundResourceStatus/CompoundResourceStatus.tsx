import { Flex, FlexItem } from "@patternfly/react-core";
import { Resource } from "@/Core";
import { words } from "@/UI";
import { LegendBar } from "../LegendBar";
import { colorConfig, statusGroupIcons, statusPriority } from "./config";

export interface CompoundResourceProps {
  /** Status counts grouped by status category. */
  compoundState: Resource.StatusCategory;

  /** Total resource count; triggers empty state when zero. */
  totalCount: number;

  /** Updates the active resource filter. */
  updateFilter: (updater: (filter: Resource.Filter) => Resource.Filter) => void;
}

/**
 * Displays a color-coded legend bar for each resource status category.
 * Clicking a segment filters resources by that status. Shows a gray bar when empty.
 */
export const CompoundResourceStatus = ({
  compoundState,
  totalCount,
  updateFilter,
}: CompoundResourceProps) => {
  const onClick = (id: Resource.CompoundStatus) => {
    return updateFilter((filter) => ({ ...filter, status: [id] }));
  };

  /** Converts a status record into an array of items consumable by LegendBar. */
  const toLegendBarItems = (record: Resource.StatusRecord) => {
    if (!totalCount) {
      return [
        {
          id: "empty",
          value: 0,
          backgroundColor: "var(--pf-t--color--gray--30)",
          isEmpty: true,
        },
      ];
    }

    const items = Object.entries(record)
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
      {Object.entries(compoundState)
        .filter(([, record]) =>
          Object.values(record as Resource.StatusRecord).some((value) => value > 0)
        )
        .map(([key, record]) => (
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
