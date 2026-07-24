import React from "react";
import { Content, Flex, FlexItem } from "@patternfly/react-core";
import styled from "styled-components";

export type HealthStatus = "healthy" | "attention" | "danger";

const STATUS_COLOR_TOKEN: Record<HealthStatus, string> = {
  healthy: "var(--pf-t--global--icon--color--status--success--default)",
  attention: "var(--pf-t--global--icon--color--status--warning--default)",
  danger: "var(--pf-t--global--icon--color--status--danger--default)",
};

interface Props {
  status: HealthStatus;
  label: string;
}

/**
 * Colored dot + text label indicating a health status.
 *
 * The status word is always rendered as text (never color-only), so the status remains legible
 * for color-blind users and screen readers alike.
 */
export const StatusIndicator: React.FC<Props> = ({ status, label }) => (
  <Flex
    alignItems={{ default: "alignItemsCenter" }}
    spaceItems={{ default: "spaceItemsSm" }}
    aria-label={`Status-${status}`}
  >
    <FlexItem>
      <Dot $color={STATUS_COLOR_TOKEN[status]} />
    </FlexItem>
    <FlexItem>
      <Content component="small">{label}</Content>
    </FlexItem>
  </Flex>
);

const Dot = styled.span<{ $color: string }>`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${(props) => props.$color};
`;
