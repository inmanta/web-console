import React, { useContext, useEffect, useState } from "react";
import { Button, Tooltip } from "@patternfly/react-core";
import { DeployAgentsAction, useDeployAgents } from "@/Data/Managers/V2/Agents";
import { ActionDisabledTooltip } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { CompileReportsIndication } from "./CompileReportsIndication";

interface Props {
  method: DeployAgentsAction;
  tooltip: string;
  textContent: string;
}

/**
 * ActionButton component for the Resources page
 *
 * This component renders a button that triggers deployment actions (deploy or repair)
 * for resources. It handles disabled states when the environment is halted and
 * shows a loading spinner during the action.
 *
 * @param {DeployAgentsAction} method - The type of deployment action (deploy or repair)
 * @param {string} tooltip - The tooltip text to display on hover
 * @param {string} textContent - The text content of the button
 *
 * @returns {React.FC<Props>} A button component with appropriate state handling
 */
export const ResourcePageActionButton: React.FC<Props> = ({ method, tooltip, textContent }) => {
  const [showSpinner, setShowSpinner] = useState(false);
  const { environmentHandler } = useContext(DependencyContext);
  const isHalted = environmentHandler.useIsHalted();

  const { mutate } = useDeployAgents();

  const handleClick = () => {
    mutate({
      method,
    });
    setShowSpinner(true);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSpinner(false);
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [showSpinner]);

  return isHalted ? (
    <ActionDisabledTooltip
      testingId={textContent}
      tooltipContent={words("environment.halt.tooltip")}
      isDisabled
    >
      <Button variant="secondary" isDisabled>
        {textContent}
      </Button>
    </ActionDisabledTooltip>
  ) : (
    <Tooltip content={tooltip} entryDelay={400}>
      <Button variant="secondary" isDisabled={showSpinner} onClick={() => handleClick()}>
        {textContent}
        {showSpinner && <CompileReportsIndication data-testid="dot-indication" />}
      </Button>
    </Tooltip>
  );
};
