import React from "react";
import { Content, Label, Tooltip } from "@patternfly/react-core";
import { RhUiInformationFillIcon } from "@patternfly/react-icons";
import { t_global_icon_color_brand_default } from "@patternfly/react-tokens";
import { State } from "@inmanta/web-console-core";
import { DynamicFAIcon } from "@inmanta/web-console-feature-lsm/Components/FaIcon";

/**
 * The InstanceStateLabel Component
 *
 * Renders a lifecycle state: `web_label` as the display text (falling back to the
 * raw state name), `web_icon` as the badge icon (in the label color, if any),
 * `web_description` as a hover tooltip (issue #7094). A badge is only shown
 * when there is a status color or a state annotation to present; otherwise the raw
 * name is rendered as plain text. Info states are a blue label with a blue icon (PatternFly's
 * info icon by default), instead of PatternFly's purple info status. A blue PatternFly `Label`
 * draws its icon near-black, so the icon gets the blue color itself.
 */
export const InstanceStateLabel: React.FC<State> = ({ name, label, annotations }) => {
  const displayName = annotations?.web_label || name;

  if (!label && !annotations) {
    return <Content>{displayName}</Content>;
  }

  const isInfo = label === "info";
  const iconColor = isInfo ? t_global_icon_color_brand_default.var : undefined;

  const stateIcon = annotations?.web_icon ? (
    <DynamicFAIcon icon={annotations.web_icon} color={iconColor} isInline />
  ) : undefined;

  const badge = isInfo ? (
    <Label
      color="blue"
      variant="outline"
      icon={stateIcon ?? <RhUiInformationFillIcon color={iconColor} />}
    >
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
