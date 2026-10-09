import React from "react";
import { Card, CardHeader } from "@patternfly/react-core";

interface Props {
  ariaLabel: string;
  onClick?: () => void;
  children: React.ReactNode;
}

/**
 * A clickable-only card, per PatternFly's Actionable card pattern
 * (https://www.patternfly.org/components/card#actionable): Card's isClickable + CardHeader's
 * selectableActions handle the click overlay, border, and hover styling automatically.
 */
export const ClickableCard: React.FC<Props> = ({ ariaLabel, onClick, children }) => (
  <Card isClickable={Boolean(onClick)} isFullHeight>
    <CardHeader
      selectableActions={
        onClick ? { onClickAction: onClick, selectableActionAriaLabel: ariaLabel } : undefined
      }
    >
      {children}
    </CardHeader>
  </Card>
);
