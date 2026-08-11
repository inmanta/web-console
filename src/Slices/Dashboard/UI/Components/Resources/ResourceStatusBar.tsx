import React from "react";
import { Content, Flex, FlexItem } from "@patternfly/react-core";
import { Resource } from "@/Core";
import { LegendBar, statusMapping, statusPriority } from "@/UI/Components";
import { colorConfig } from "@/UI/Components/CompoundResourceStatus/config";
import { words } from "@/UI/words";
import { Dot } from "../EnvironmentHealth/Dot";

// Slimmer than the Resources page's own 20px bars (CompoundResourceStatus) - a dashboard card
// row has no room for the in-segment count text, so segments only show their color; counts
// move to the legend row below instead.
const BAR_HEIGHT = "12px";

interface Props {
  title: string;
  counts: Resource.CompoundStateSummary[keyof Resource.CompoundStateSummary] | undefined;
  totalCount: number;
  onSegmentClick: (status: Resource.CompoundStateKey) => void;
}

/**
 * One labeled row of the Resource Manager card (Compliance / Deploy result / Blocked): a
 * title, a slim stacked bar, and a legend of each present status's color dot + count. Reuses
 * the Resources page's color/label/priority mapping (CompoundResourceStatus's config) and
 * LegendBar primitive so status colors stay consistent across the app. Segment clicks are
 * delegated to the parent, which navigates to the Resources page pre-filtered by that status.
 */
export const ResourceStatusBar: React.FC<Props> = ({
  title,
  counts,
  totalCount,
  onSegmentClick,
}) => {
  const presentEntries = (Object.entries(counts ?? {}) as [Resource.CompoundStateKey, number][])
    .filter(([, value]) => value > 0)
    .sort(([a], [b]) => statusPriority[a] - statusPriority[b]);

  const items =
    totalCount === 0
      ? [
          {
            id: "empty",
            value: 0,
            backgroundColor: "var(--pf-t--color--gray--30)",
            isEmpty: true,
            label: words("resources.empty.message"),
            height: BAR_HEIGHT,
          },
        ]
      : presentEntries.map(([status, value]) => ({
          id: status,
          value,
          backgroundColor: colorConfig[status],
          label: statusMapping[status.toUpperCase() as Resource.CompoundState],
          height: BAR_HEIGHT,
          showValue: false,
          onClick: onSegmentClick,
        }));

  return (
    <Flex direction={{ default: "column" }} spaceItems={{ default: "spaceItemsXs" }}>
      <Content component="p" style={{ fontWeight: 700 }}>
        {title}
      </Content>
      <LegendBar items={items} aria-label={title} />
      {totalCount > 0 && (
        <Flex spaceItems={{ default: "spaceItemsMd" }} columnGap={{ default: "columnGapMd" }}>
          {presentEntries.map(([status, value]) => (
            <Flex
              key={status}
              alignItems={{ default: "alignItemsCenter" }}
              spaceItems={{ default: "spaceItemsXs" }}
            >
              <FlexItem>
                <Dot $color={colorConfig[status]} />
              </FlexItem>
              <FlexItem>
                <Content component="small">
                  {statusMapping[status.toUpperCase() as Resource.CompoundState]}{" "}
                  <strong>{value.toLocaleString()}</strong>
                </Content>
              </FlexItem>
            </Flex>
          ))}
        </Flex>
      )}
    </Flex>
  );
};
