import React from "react";
import { Content, Label, Tooltip } from "@patternfly/react-core";
import { RhUiInformationFillIcon } from "@patternfly/react-icons";
import { State } from "@inmanta/web-console-core";
import { DynamicFAIcon } from "@inmanta/web-console-feature-lsm/Components/FaIcon";

/**
 * The InstanceStateLabel Component
 *
 * Renders a lifecycle state: `web_label` as the display text (falling back to the
 * raw state name), `web_icon` as the badge icon (in the label color, if any),
 * `web_description` as a hover tooltip (issue #7094). A badge is only shown
 * when there is a status color or a state annotation to present; otherwise the raw
 * name is rendered as plain text. Info states are blue with PatternFly's info icon,
 * like the other info labels in the console, instead of PatternFly's purple info status.
 */
export const InstanceStateLabel: React.FC<State> = ({ name, label, annotations }) => {
  const displayName = annotations?.web_label || name;

  if (!label && !annotations) {
    return <Content>{displayName}</Content>;
  }

  const stateIcon = annotations?.web_icon ? (
    <DynamicFAIcon icon={annotations.web_icon} isInline />
  ) : undefined;

  const badge =
    label === "info" ? (
      <Label color="blue" variant="outline" icon={stateIcon ?? <RhUiInformationFillIcon />}>
        {displayName}
      </Label>
    ) : (
      <Label status={label ?? undefined} variant="outline" icon={stateIcon}>
        {displayName}
      </Label>
    );

  if (annotations?.web_description) {
    return <Tooltip content={annotations.web_description}>{badge}</Tooltip>;
  }

  return badge;
};
