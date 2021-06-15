import { InstanceSummary } from "@/Core";
import React from "react";
import { words } from "@/UI/words";
import { Flex, FlexItem, Title } from "@patternfly/react-core";
import { DeleteEntityModal } from "../DeleteEntityModal";
import { EmptyView, Spacer, SummaryChart } from "@/UI/Components";

interface Props {
  serviceName: string;
  instanceSummary?: InstanceSummary;
}

export const Details: React.FC<Props> = ({ serviceName, instanceSummary }) => {
  return (
    <Flex spaceItems={{ default: "spaceItemsXl" }}>
      <Flex direction={{ default: "column" }}>
        <Spacer />
        <FlexItem>
          <Title headingLevel="h3">{words("catalog.summary.title")}</Title>
        </FlexItem>
        <FlexItem>
          {instanceSummary ? (
            <SummaryChart
              by_label={instanceSummary.by_label}
              total={instanceSummary.total}
            />
          ) : (
            <EmptyView message={words("catalog.summary.empty")} />
          )}
        </FlexItem>
      </Flex>
      <Flex direction={{ default: "column" }}>
        <Spacer />
        <FlexItem>
          <Title headingLevel="h3">
            {words("inventory.statustab.actions")}
          </Title>
        </FlexItem>
        <FlexItem>
          <DeleteEntityModal serviceName={serviceName} />
        </FlexItem>
      </Flex>
    </Flex>
  );
};
