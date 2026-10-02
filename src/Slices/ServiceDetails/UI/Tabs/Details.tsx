import React from "react";
import { Flex, FlexItem, Title } from "@patternfly/react-core";
import { InstanceSummary } from "@/Core";
import { EmptyView, InstanceCounts } from "@/UI/Components";
import { words } from "@/UI/words";

interface Props {
  instanceSummary?: InstanceSummary | null;
}

export const Details: React.FC<Props> = ({ instanceSummary }) => {
  return (
    <Flex direction={{ default: "column" }} rowGap={{ default: "rowGapMd" }}>
      <FlexItem>
        <Title headingLevel="h3">{words("catalog.summary.title")}</Title>
      </FlexItem>
      <FlexItem>
        {instanceSummary ? (
          <InstanceCounts summary={instanceSummary} />
        ) : (
          <EmptyView message={words("catalog.summary.empty")} />
        )}
      </FlexItem>
    </Flex>
  );
};
