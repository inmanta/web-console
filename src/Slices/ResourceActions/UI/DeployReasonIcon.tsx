import React from "react";
import { Icon, Tooltip } from "@patternfly/react-core";
import { BellIcon, OutlinedClockIcon, QuestionCircleIcon, UserIcon } from "@patternfly/react-icons";
import { words } from "@/UI/words";
import { classifyDeployReason, getDeployReasonText } from "@S/ResourceActions/Core/DeployReason";
import { ResourceAction } from "@S/ResourceActions/Core/Domain";

interface Props {
  action: ResourceAction;
}

const icons = {
  event: <BellIcon />,
  timer: <OutlinedClockIcon />,
  operator: <UserIcon />,
  unknown: <QuestionCircleIcon />,
};

/**
 * Displays an icon representing the reason of a deployment (event, timer,
 * operator trigger or unknown), with the raw reason string as a tooltip.
 *
 * @props {Props} props - The props of the component.
 *  @prop {ResourceAction} action - The resource action.
 * @returns {React.FC<Props>} The deploy reason icon.
 */
export const DeployReasonIcon: React.FC<Props> = ({ action }) => {
  const kind = classifyDeployReason(action);
  const tooltip = getDeployReasonText(action) ?? words(`resourceActions.reason.${kind}`);

  return (
    <Tooltip content={tooltip}>
      <Icon aria-label={words(`resourceActions.reason.${kind}`)}>{icons[kind]}</Icon>
    </Tooltip>
  );
};
