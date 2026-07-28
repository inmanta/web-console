import React from "react";
import { Card, CardBody, Content, Flex, FlexItem, Label } from "@patternfly/react-core";
import { CheckIcon, ExclamationIcon } from "@patternfly/react-icons";
import styled from "styled-components";
import { words } from "@/UI/words";
import { Dot } from "./Dot";

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
  switchAction: React.ReactNode;
}

const TONE_COLOR = {
  success: "var(--pf-t--global--icon--color--status--success--default)",
  danger: "var(--pf-t--global--icon--color--status--danger--default)",
};

/**
 * Left-hand card of the Environment Health row: environment identity, an env-switch trigger,
 * and an "Operational" verdict with a checklist of the underlying orchestrator health signals.
 *
 * Not a clickable-only card (unlike HealthColumn): PatternFly's Actionable card pattern
 * explicitly disallows combining a whole-card click with other interactive content, and this
 * card already has its own "Switch" action.
 */
export const OrchestratorCard: React.FC<Props> = ({
  icon,
  name,
  badge,
  operational,
  checklist,
  switchAction,
}) => {
  const tone = operational ? "success" : "danger";

  return (
    <Card isFullHeight>
      <CardBody>
        <Flex direction={{ default: "column" }} spaceItems={{ default: "spaceItemsMd" }}>
          <Flex justifyContent={{ default: "justifyContentSpaceBetween" }}>
            <Flex
              alignItems={{ default: "alignItemsCenter" }}
              spaceItems={{ default: "spaceItemsSm" }}
            >
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
            <FlexItem>{switchAction}</FlexItem>
          </Flex>
          <FlexItem>
            <Content component="small">
              {words("dashboardV2.environmentHealth.orchestratorLabel")}
            </Content>
          </FlexItem>
          <Flex
            alignItems={{ default: "alignItemsCenter" }}
            spaceItems={{ default: "spaceItemsMd" }}
          >
            <FlexItem>
              <IconBadge $tone={tone}>
                {operational ? <CheckIcon /> : <ExclamationIcon />}
              </IconBadge>
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
                  <Flex
                    alignItems={{ default: "alignItemsCenter" }}
                    spaceItems={{ default: "spaceItemsSm" }}
                  >
                    <FlexItem>
                      <Dot $color={item.ok ? TONE_COLOR.success : TONE_COLOR.danger} />
                    </FlexItem>
                    <FlexItem>
                      <Content component="small">{item.label}</Content>
                    </FlexItem>
                  </Flex>
                </FlexItem>
              ))}
            </Flex>
          </Flex>
        </Flex>
      </CardBody>
    </Card>
  );
};

const IconBadge = styled.div<{ $tone: "success" | "danger" }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background-color: color-mix(in srgb, ${(props) => TONE_COLOR[props.$tone]} 15%, transparent);
  color: color-mix(in srgb, ${(props) => TONE_COLOR[props.$tone]} 70%, white);

  svg {
    width: 1.375rem;
    height: 1.375rem;
  }
`;
