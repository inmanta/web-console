import React from "react";
import { Flex, FlexItem, Title } from "@patternfly/react-core";
import { InstanceSummary } from "@/Core";
import { EmptyView, Spacer, SummaryChart } from "@/UI/Components";
import { words } from "@/UI/words";
import { DeleteEntityModal } from "./DeleteEntityModal";

interface Props {
  serviceName: string;
  instanceSummary?: InstanceSummary | null;
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
              total={instanceSummary.total.toString()}
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
