import React from "react";
import { Flex, FlexItem, Icon, Label, Tooltip } from "@patternfly/react-core";
import { SitemapIcon } from "@patternfly/react-icons";
import styled from "styled-components";
import { words } from "@inmanta/web-console-core";
import {
  getLabelColorProps,
  getLabelName,
  LabelIcon,
  StateCountsTooltipContent,
  StateCountsTooltipRow,
} from "@inmanta/web-console-feature-lsm/Components/InstanceSummaryLabels";
import { getLabelCounts } from "./helpers";
import { OwnedServiceStateCount } from "./types";

interface Props {
  stateCounts: OwnedServiceStateCount[];
}

/**
 * The "not success" label of a collapsed service that owns other services: one count per label
 * over the instances of the owned services that are not in a "success" state. The border takes
 * the color of the most severe label, and the tooltip lists each owned service and state with its
 * count. Renders nothing when there are no such instances.
 *
 * @props {Props} props - The props of the component.
 *  @prop {OwnedServiceStateCount[]} stateCounts - The non-success instance counts of the owned
 *  services, most severe first.
 *
 * @returns {React.FC<Props>} The "not success" label.
 */
export const OwnedServicesNotSuccessLabel: React.FC<Props> = ({ stateCounts }) => {
  const labelCounts = getLabelCounts(stateCounts);

  if (labelCounts.length === 0) {
    return null;
  }

  const tooltipRows: StateCountsTooltipRow[] = stateCounts.map(
    ({ ownedServiceName, ownedServiceTitle, stateName, stateDisplayName, count }) => ({
      key: `${ownedServiceName}-${stateName}`,
      displayName: words("catalog.ownedServices.ownedServiceState")(
        ownedServiceTitle,
        stateDisplayName
      ),
      count,
    })
  );

  return (
    <Tooltip
      content={
        <StateCountsTooltipContent
          title={words("catalog.ownedServices.notSuccess")}
          rows={tooltipRows}
        />
      }
      entryDelay={200}
    >
      <DashedLabel
        variant="outline"
        icon={<SitemapIcon />}
        role="group"
        aria-label={words("catalog.ownedServices.notSuccess")}
        tabIndex={0}
        {...getLabelColorProps(labelCounts[0].label)}
      >
        <Flex component="span" gap={{ default: "gapSm" }} flexWrap={{ default: "nowrap" }}>
          {labelCounts.map(({ label, count }) => (
            <Flex
              key={label}
              component="span"
              gap={{ default: "gapXs" }}
              alignItems={{ default: "alignItemsCenter" }}
              flexWrap={{ default: "nowrap" }}
            >
              <Icon status={getLabelColorProps(label).status} isInline>
                <LabelIcon label={label} title={getLabelName(label)} />
              </Icon>
              <FlexItem component="span">{count}</FlexItem>
            </Flex>
          ))}
        </Flex>
      </DashedLabel>
    </Tooltip>
  );
};

/**
 * A label with a dashed border, so the "not success" label of the owned services reads apart
 * from the own status labels. PatternFly draws the label border on the content's `::before` with
 * a fixed solid style and has no prop for it, so this overrides PatternFly's internal
 * `pf-v6-c-label__content` class and must follow it on a PatternFly major upgrade.
 */
const DashedLabel = styled(Label)`
  && .pf-v6-c-label__content::before {
    border-style: dashed;
  }
`;
