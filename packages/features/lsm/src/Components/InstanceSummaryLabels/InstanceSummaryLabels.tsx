import React, { ReactElement } from "react";
import { Label, LabelProps, FlexItem, Flex, Tooltip } from "@patternfly/react-core";
import { InstanceSummary, StateModel, words } from "@inmanta/web-console-core";
import { LabelIcon } from "./LabelIcon";
import { StateCountsTooltipContent } from "./StateCountsTooltipContent";
import { getLabelName, getStateCounts } from "./helpers";
import {
  LabelFiltering,
  StateCountsTooltipRow,
  SummaryLabel,
  summaryLabelColors,
  summaryLabels,
} from "./types";

interface Props {
  summary: InstanceSummary;
  states: StateModel[];
  filtering?: LabelFiltering;
}

/**
 * Shows one status label per lifecycle label with a non-zero instance count, most severe first.
 * The tooltip of a label breaks its count down per lifecycle state. With `filtering` the labels
 * become toggle buttons and the active one is filled.
 *
 * @props {Props} props - The props of the component.
 *  @prop {InstanceSummary} summary - The instance summary of the service.
 *  @prop {StateModel[]} states - The lifecycle states of the service, for the state names and labels.
 *  @prop {LabelFiltering} [filtering] - Makes the labels toggle a filter.
 *
 * @returns {React.FC<Props>} The rendered labels.
 */
export const InstanceSummaryLabels: React.FC<Props> = ({ summary, states, filtering }) => {
  const stateCounts = getStateCounts(summary, states);

  return (
    <Flex
      aria-label={words("catalog.summary.title")}
      gap={{ default: "gapSm" }}
      flexWrap={{ default: "nowrap" }}
    >
      {summaryLabels
        .filter((label) => Number(summary.by_label[label]) > 0)
        .map((label) => {
          const tooltipRows: StateCountsTooltipRow[] = stateCounts
            .filter((stateCount) => stateCount.label === label)
            .map(({ stateName, stateDisplayName, count }) => ({
              key: stateName,
              displayName: stateDisplayName,
              count,
            }));

          return (
            <FlexItem key={label}>
              <Tooltip
                content={
                  <StateCountsTooltipContent title={getLabelName(label)} rows={tooltipRows} />
                }
                entryDelay={200}
              >
                {renderLabel(label, Number(summary.by_label[label]), filtering)}
              </Tooltip>
            </FlexItem>
          );
        })}
    </Flex>
  );
};

/**
 * Renders the PatternFly label for a count. It is a toggle button when filtering is given, and
 * focusable otherwise, so its tooltip also opens from the keyboard.
 */
const renderLabel = (
  label: SummaryLabel,
  value: number,
  filtering?: LabelFiltering
): ReactElement => {
  const isActive = filtering?.activeLabel === label;
  const interactionProps: Partial<LabelProps> = filtering
    ? {
        isClickable: true,
        render: ({ className, content, componentRef }) => (
          <button
            type="button"
            ref={componentRef}
            className={className}
            aria-label={`${getLabelName(label)}: ${value}`}
            aria-pressed={isActive}
            onClick={() => filtering.onToggle(label)}
          >
            {content}
          </button>
        ),
      }
    : { tabIndex: 0 };

  return (
    <Label
      variant={isActive ? "filled" : "outline"}
      icon={<LabelIcon label={label} />}
      {...summaryLabelColors[label]}
      {...interactionProps}
    >
      {value}
    </Label>
  );
};
