import { words } from "@/UI";
import { Tooltip } from "@patternfly/react-core";
import React from "react";
import { ReactElement } from "react";

interface Props {
  // Type of children from the Tooltip component of Patternfly
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  children?: ReactElement<any>;
  isDisabled?: boolean;
}

export const ActionDisabledTooltip: React.FC<Props> = ({
  children,
  isDisabled,
}) => {
  if (isDisabled) {
    return (
      <Tooltip
        entryDelay={200}
        content={words("inventory.statustab.actionDisabled")}
      >
        {children}
      </Tooltip>
    );
  } else {
    return <>{children}</>;
  }
};
