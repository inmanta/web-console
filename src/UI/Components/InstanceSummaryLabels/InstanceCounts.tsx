import React from "react";
import { Content, ContentVariants, Flex, FlexItem } from "@patternfly/react-core";
import { InstanceSummary } from "@/Core";
import { words } from "@/UI/words";
import { InstanceSummaryLabels, LabelFiltering } from "./InstanceSummaryLabels";

interface Props {
  summary: InstanceSummary;
  filtering?: LabelFiltering;
}

/**
 * Shows the total number of instances followed by the count per status label.
 * With `filtering` the labels toggle a state filter.
 *
 * @props {Props} props - The props of the component.
 *  @prop {InstanceSummary} summary - The instance summary of the service.
 *  @prop {LabelFiltering} [filtering] - Makes the labels toggle a filter.
 *
 * @returns {React.FC<Props>} The rendered total and labels.
 */
export const InstanceCounts: React.FC<Props> = ({ summary, filtering }) => (
  <Flex alignItems={{ default: "alignItemsCenter" }} gap={{ default: "gapSm" }}>
    <FlexItem>
      <Content component={ContentVariants.p}>
        {words("catalog.summary.total")(Number(summary.total))}
      </Content>
    </FlexItem>
    <InstanceSummaryLabels byLabel={summary.by_label} filtering={filtering} />
  </Flex>
);
