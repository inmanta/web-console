import React, { ReactElement } from "react";
import { Label, LabelProps, FlexItem, Flex, Tooltip } from "@patternfly/react-core";
import { InfoAltIcon, OutlinedCircleIcon } from "@patternfly/react-icons";
import { InstancesByLabel } from "@/Core";
import { words } from "@/UI/words";

/**
 * A lifecycle state label that instances can be counted by.
 */
export type SummaryLabel = keyof InstancesByLabel;

/**
 * Turns the labels into filter toggles. `activeLabel` is the label whose filter is on, or null
 * when none is.
 */
export interface LabelFiltering {
  activeLabel: SummaryLabel | null;
  onToggle: (label: SummaryLabel) => void;
}

interface Props {
  byLabel: InstancesByLabel;
  filtering?: LabelFiltering;
}

/**
 * The summary labels in display order, most severe first.
 */
export const summaryLabels: SummaryLabel[] = ["danger", "warning", "success", "info", "no_label"];

/**
 * Shows one status label per lifecycle label with a non-zero instance count.
 * With `filtering` the labels become toggle buttons and the active one is filled.
 *
 * @props {Props} props - The props of the component.
 *  @prop {InstancesByLabel} byLabel - The number of instances per label.
 *  @prop {LabelFiltering} [filtering] - Makes the labels toggle a filter.
 *
 * @returns {React.FC<Props>} The rendered labels.
 */
export const InstanceSummaryLabels: React.FC<Props> = ({ byLabel, filtering }) => (
  <Flex aria-label={words("catalog.summary.title")} gap={{ default: "gapSm" }}>
    {summaryLabels
      .filter((label) => Number(byLabel[label]) > 0)
      .map((label) => (
        <FlexItem key={label}>
          <Tooltip content={getLabelName(label)} entryDelay={200}>
            {getLabel(label, Number(byLabel[label]), filtering)}
          </Tooltip>
        </FlexItem>
      ))}
  </Flex>
);

/**
 * Gets the display name of a label.
 *
 * @example getLabelName("no_label") // "no label"
 */
const getLabelName = (label: SummaryLabel): string =>
  label === "no_label" ? words("catalog.summary.noLabel") : label;

/**
 * Builds the PatternFly label for a count. It is a toggle button when filtering is given.
 *
 * @example getLabel("danger", 3) // <Label status="danger" variant="outline">3</Label>
 */
function getLabel(label: SummaryLabel, value: number, filtering?: LabelFiltering): ReactElement {
  const isActive = filtering?.activeLabel === label;
  const toggleProps: Partial<LabelProps> | undefined = filtering && {
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
  };
  const variant = isActive ? "filled" : "outline";

  switch (label) {
    case "danger":
    case "warning":
    case "success":
      return (
        <Label status={label} variant={variant} {...toggleProps}>
          {value}
        </Label>
      );
    case "info":
      return (
        <Label color="blue" variant={variant} icon={<InfoAltIcon />} {...toggleProps}>
          {value}
        </Label>
      );
    case "no_label":
      return (
        <Label variant={variant} icon={<OutlinedCircleIcon />} {...toggleProps}>
          {value}
        </Label>
      );
  }
}
