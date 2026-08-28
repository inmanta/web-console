import React from "react";
import { Content, Label, Tooltip } from "@patternfly/react-core";
import { State } from "@/Core";
import { DynamicFAIcon } from "@/UI/Components/FaIcon";

/**
 * PatternFly's `Icon` (rendered inside `DynamicFAIcon`) sets its own
 * `--pf-v6-c-icon__content--Color` default directly on the icon wrapper, which
 * shadows the `currentColor` it would otherwise inherit from the outline Label's
 * status color - so the badge icon needs this color passed in explicitly to match
 * the label instead of always rendering in the neutral default color (issue #7094).
 */
const STATUS_ICON_COLOR: Record<NonNullable<State["label"]>, string> = {
  info: "var(--pf-t--global--icon--color--status--info--default)",
  success: "var(--pf-t--global--icon--color--status--success--default)",
  warning: "var(--pf-t--global--icon--color--status--warning--default)",
  danger: "var(--pf-t--global--icon--color--status--danger--default)",
};

/**
 * The InstanceStateLabel Component
 *
 * Renders a lifecycle state: `web_label` as the display text (falling back to the
 * raw state name), `web_icon` as the badge icon (colored to match the status, if
 * any), `web_description` as a hover tooltip (issue #7094). A badge is only shown
 * when there is a status color or a state annotation to present; otherwise the raw
 * name is rendered as plain text.
 */
export const InstanceStateLabel: React.FC<State> = ({ name, label, annotations }) => {
  const displayName = annotations?.web_label || name;

  if (!label && !annotations) {
    return <Content>{displayName}</Content>;
  }

  const badge = (
    <Label
      status={label ?? undefined}
      variant="outline"
      icon={
        annotations?.web_icon ? (
          <DynamicFAIcon
            icon={annotations.web_icon}
            color={label ? STATUS_ICON_COLOR[label] : undefined}
          />
        ) : undefined
      }
    >
      {displayName}
    </Label>
  );

  if (annotations?.web_description) {
    return <Tooltip content={annotations.web_description}>{badge}</Tooltip>;
  }

  return badge;
};
