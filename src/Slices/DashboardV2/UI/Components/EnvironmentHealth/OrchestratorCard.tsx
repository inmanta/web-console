import React from "react";
import { Button, Card, CardBody, Content, Flex, FlexItem, Label } from "@patternfly/react-core";
import { CheckIcon, ExclamationIcon } from "@patternfly/react-icons";
import { words } from "@/UI/words";
import { IconBadge, TONE_COLOR } from "../IconBadge";
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
  onSwitchClick: () => void;
}

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
  onSwitchClick,
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
                <Content component="h3">{name}</Content>
              </FlexItem>
              {badge && (
                <FlexItem>
                  <Label isCompact>{badge}</Label>
                </FlexItem>
              )}
            </Flex>
            <FlexItem>
              <Button
                variant="link"
                isInline
                onClick={(event) => {
                  // The header's own env-selector menu closes on any click outside its toggle
                  // button (a global window click listener). Since this button is a different
                  // element, without stopping propagation that same click would open the menu
                  // and immediately close it again as an "outside click".
                  event.stopPropagation();
                  onSwitchClick();
                }}
              >
                {words("dashboardV2.environmentHealth.switch")} &gt;
              </Button>
            </FlexItem>
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
              <IconBadge $tone={tone} $size="lg">
                {operational ? <CheckIcon /> : <ExclamationIcon />}
              </IconBadge>
            </FlexItem>
            <Flex direction={{ default: "column" }} spaceItems={{ default: "spaceItemsXs" }}>
              <FlexItem>
                <Content component="h4">
                  {operational
                    ? words("dashboardV2.environmentHealth.operational")
                    : words("dashboardV2.environmentHealth.status.attention")}
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
