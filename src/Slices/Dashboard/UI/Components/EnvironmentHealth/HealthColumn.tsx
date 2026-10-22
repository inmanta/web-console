import React from "react";
import { Content, Flex, FlexItem } from "@patternfly/react-core";
import { WordKey, words } from "@/Core";
import { ClickableCard } from "./ClickableCard";
import { HealthStatus, StatusIndicator } from "./StatusIndicator";

const STATUS_LABEL_KEY = {
  healthy: "dashboard.environmentHealth.status.healthy",
  attention: "dashboard.environmentHealth.status.attention",
  danger: "dashboard.environmentHealth.status.danger",
} as const satisfies Record<HealthStatus, WordKey>;

const STATUS_TEXT_COLOR: Record<HealthStatus, string> = {
  healthy: "var(--pf-t--global--text--color--status--success--default)",
  attention: "var(--pf-t--global--text--color--status--warning--default)",
  danger: "var(--pf-t--global--text--color--status--danger--default)",
};

interface Props {
  title: string;
  status: HealthStatus;
  statLines: string[];
  onClick?: () => void;
}

/**
 * One column of the Environment Health card grid (Services / Resources / Compiles / Agents):
 * a dot+title status indicator, a bold status word, and 1-2 lines of supporting stats. The whole
 * column is a clickable card that drills into the relevant page.
 */
export const HealthColumn: React.FC<Props> = ({ title, status, statLines, onClick }) => (
  <ClickableCard
    ariaLabel={words("dashboard.environmentHealth.viewDetails")(title)}
    onClick={onClick}
  >
    <Flex direction={{ default: "column" }} spaceItems={{ default: "spaceItemsXs" }}>
      <FlexItem>
        <StatusIndicator status={status} label={title} />
      </FlexItem>
      <FlexItem>
        <Content component="h4" style={{ color: STATUS_TEXT_COLOR[status] }}>
          {words(STATUS_LABEL_KEY[status])}
        </Content>
      </FlexItem>
      {statLines.map((line) => (
        <FlexItem key={line}>
          <Content component="small">{line}</Content>
        </FlexItem>
      ))}
    </Flex>
  </ClickableCard>
);
