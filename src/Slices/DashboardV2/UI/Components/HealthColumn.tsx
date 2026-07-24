import React from "react";
import { Content, Flex, FlexItem } from "@patternfly/react-core";
import { HealthStatus, StatusIndicator } from "./StatusIndicator";

const STATUS_LABEL: Record<HealthStatus, string> = {
  healthy: "Healthy",
  attention: "Attention",
  danger: "Danger",
};

interface Props {
  title: string;
  status: HealthStatus;
  statLines: string[];
}

/**
 * One column of the Environment Health card grid (Services / Resources / Compiles / Agents):
 * a dot+title status indicator, a bold status word, and 1-2 lines of supporting stats.
 */
export const HealthColumn: React.FC<Props> = ({ title, status, statLines }) => (
  <Flex direction={{ default: "column" }} spaceItems={{ default: "spaceItemsXs" }}>
    <FlexItem>
      <StatusIndicator status={status} label={title} />
    </FlexItem>
    <FlexItem>
      <Content component="h4" style={{ color: STATUS_TEXT_COLOR[status] }}>
        {STATUS_LABEL[status]}
      </Content>
    </FlexItem>
    {statLines.map((line) => (
      <FlexItem key={line}>
        <Content component="small">{line}</Content>
      </FlexItem>
    ))}
  </Flex>
);

const STATUS_TEXT_COLOR: Record<HealthStatus, string> = {
  healthy: "var(--pf-t--global--text--color--status--success--default)",
  attention: "var(--pf-t--global--text--color--status--warning--default)",
  danger: "var(--pf-t--global--text--color--status--danger--default)",
};
