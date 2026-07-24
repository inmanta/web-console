import React from "react";
import { Button, Content, Flex, FlexItem, Icon, Label } from "@patternfly/react-core";
import { CheckCircleIcon, ExclamationCircleIcon } from "@patternfly/react-icons";
import { words } from "@/UI/words";

export interface ChecklistItem {
  label: string;
  ok: boolean;
}

interface Props {
  icon: React.ReactNode;
  name: string;
  badge?: string;
  operational: boolean;
  checklist: ChecklistItem[];
  onSwitchClick?: () => void;
}

/**
 * Left-hand card of the Environment Health row: environment identity, an env-switch trigger,
 * and an "Operational" verdict with a checklist of the underlying orchestrator health signals.
 */
export const OrchestratorCard: React.FC<Props> = ({
  icon,
  name,
  badge,
  operational,
  checklist,
  onSwitchClick,
}) => (
  <Flex direction={{ default: "column" }} spaceItems={{ default: "spaceItemsMd" }}>
    <Flex justifyContent={{ default: "justifyContentSpaceBetween" }}>
      <Flex alignItems={{ default: "alignItemsCenter" }} spaceItems={{ default: "spaceItemsSm" }}>
        <FlexItem>{icon}</FlexItem>
        <FlexItem>
          <Content component="p" style={{ fontWeight: 700 }}>
            {name}
          </Content>
        </FlexItem>
        {badge && (
          <FlexItem>
            <Label isCompact>{badge}</Label>
          </FlexItem>
        )}
      </Flex>
      <FlexItem>
        <Button variant="link" isInline onClick={onSwitchClick}>
          {words("dashboardV2.environmentHealth.switch")} &gt;
        </Button>
      </FlexItem>
    </Flex>
    <FlexItem>
      <Content component="small">{words("dashboardV2.environmentHealth.orchestratorLabel")}</Content>
    </FlexItem>
    <Flex alignItems={{ default: "alignItemsCenter" }} spaceItems={{ default: "spaceItemsMd" }}>
      <FlexItem>
        <Icon size="lg" status={operational ? "success" : "danger"}>
          {operational ? <CheckCircleIcon /> : <ExclamationCircleIcon />}
        </Icon>
      </FlexItem>
      <Flex direction={{ default: "column" }} spaceItems={{ default: "spaceItemsXs" }}>
        <FlexItem>
          <Content component="h4">
            {operational
              ? words("dashboardV2.environmentHealth.operational")
              : words("dashboardV2.environmentHealth.degraded")}
          </Content>
        </FlexItem>
        {checklist.map((item) => (
          <FlexItem key={item.label}>
            <Content component="small">
              <Icon size="sm" status={item.ok ? "success" : "danger"}>
                {item.ok ? <CheckCircleIcon /> : <ExclamationCircleIcon />}
              </Icon>{" "}
              {item.label}
            </Content>
          </FlexItem>
        ))}
      </Flex>
    </Flex>
  </Flex>
);
