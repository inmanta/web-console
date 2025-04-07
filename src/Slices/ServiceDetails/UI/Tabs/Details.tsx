import React from "react";
import { Flex, FlexItem, Title } from "@patternfly/react-core";
import { InstanceSummary } from "@/Core";
import { EmptyView, SummaryChart } from "@/UI/Components";
import { words } from "@/UI/words";

interface Props {
  instanceSummary?: InstanceSummary | null;
}

export const Details: React.FC<Props> = ({ instanceSummary }) => {
  return (
    <Flex spaceItems={{ default: "spaceItemsXl" }}>
      <Flex direction={{ default: "column" }} rowGap={{ default: "rowGapMd" }}>
        <FlexItem>
          <Title headingLevel="h3">{words("catalog.summary.title")}</Title>
        </FlexItem>
        <FlexItem>
          {instanceSummary ? (
            <SummaryChart
              by_label={instanceSummary.by_label}
              total={instanceSummary.total.toString()}
            />
          ) : (
            <EmptyView message={words("catalog.summary.empty")} />
          )}
        </FlexItem>
      </Flex>
    </Flex>
  );
};
