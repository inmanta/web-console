import React from "react";
import { Flex, FlexItem, Title } from "@patternfly/react-core";
import { InstanceSummary, StateModel, words } from "@inmanta/web-console-core";
import { InstanceCounts } from "@inmanta/web-console-feature-lsm/Components/InstanceSummaryLabels";
import { EmptyView } from "@inmanta/web-console-ui/Components/EmptyView";

interface Props {
  instanceSummary?: InstanceSummary | null;
  states: StateModel[];
}

export const Details: React.FC<Props> = ({ instanceSummary, states }) => {
  return (
    <Flex direction={{ default: "column" }} rowGap={{ default: "rowGapMd" }}>
      <FlexItem>
        <Title headingLevel="h3">{words("catalog.summary.title")}</Title>
      </FlexItem>
      <FlexItem>
        {instanceSummary ? (
          <InstanceCounts summary={instanceSummary} states={states} />
        ) : (
          <EmptyView message={words("catalog.summary.empty")} />
        )}
      </FlexItem>
    </Flex>
  );
};
