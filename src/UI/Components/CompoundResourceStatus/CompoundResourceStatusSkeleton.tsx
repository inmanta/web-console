import { Flex, FlexItem, Skeleton } from "@patternfly/react-core";
import { Resource } from "@/Core";
import { words } from "@/UI";
import { BAR_ITEM_HEIGHT } from "./CompoundResourceStatus";
import { statusGroupIcons } from "./config";

const statusGroups: (keyof Resource.CompoundStateSummary)[] = [
  "blocked",
  "compliance",
  "lastHandlerRun",
];

/**
 * Placeholder for CompoundResourceStatus while the resource summary loads.
 * Shows the same status icons with a shimmering bar in place of each legend bar, so the layout does not shift.
 *
 * @example
 * {resourceSummary ? <CompoundResourceStatus ... /> : <CompoundResourceStatusSkeleton />}
 */
export const CompoundResourceStatusSkeleton = () => (
  <Flex
    direction={{ default: "column" }}
    gap={{ default: "gapSm" }}
    flex={{ default: "flex_1" }}
    aria-busy
    aria-label={words("resources.compoundStateSummary.loading")}
  >
    {statusGroups.map((key) => (
      <Flex key={key} flex={{ default: "flex_1" }} alignItems={{ default: "alignItemsCenter" }}>
        <FlexItem style={{ display: "inline-flex" }}>{statusGroupIcons[key]()}</FlexItem>
        <FlexItem flex={{ default: "flex_1" }}>
          <Skeleton height={BAR_ITEM_HEIGHT} />
        </FlexItem>
      </Flex>
    ))}
  </Flex>
);
