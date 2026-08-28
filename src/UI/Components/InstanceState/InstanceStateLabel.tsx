import React from "react";
import { Content, Label, Tooltip } from "@patternfly/react-core";
import { State } from "@/Core";
import { DynamicFAIcon } from "@/UI/Components/FaIcon";

/**
 * The InstanceStateLabel Component
 *
 * Renders a lifecycle state: `web_label` as the display text (falling back to the
 * raw state name), `web_icon` as the badge icon, `web_description` as a hover
 * tooltip (issue #7094). A badge is only shown when there is a status color or a
 * state annotation to present; otherwise the raw name is rendered as plain text.
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
      icon={annotations?.web_icon ? <DynamicFAIcon icon={annotations.web_icon} /> : undefined}
    >
      {displayName}
    </Label>
  );

  if (annotations?.web_description) {
    return <Tooltip content={annotations.web_description}>{badge}</Tooltip>;
  }

  return badge;
};
