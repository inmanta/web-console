import { Button, ButtonProps } from "@patternfly/react-core";
import React from "react";

/** Wraps a Patternfly button to make sure the cursor is set to not allowed, if the button is disabled */
export const ButtonWithCursorHandling: React.FC<ButtonProps> = (
  buttonProps
) => {
  return (
    <Button
      {...buttonProps}
      style={buttonProps.isDisabled ? { cursor: "not-allowed" } : {}}
    ></Button>
  );
};
