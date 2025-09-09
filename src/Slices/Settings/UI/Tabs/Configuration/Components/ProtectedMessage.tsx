import React from "react";
import { HelperText, HelperTextItem } from "@patternfly/react-core";
import { EnvironmentSettings } from "@/Core";
import { words } from "@/UI";

interface Props {
  info: EnvironmentSettings.InputInfo;
}

/**
 * ProtectedMessage is a component that displays a warning message if the input is protected.
 * @param info - The info of the input.
 * @returns A React component.
 */
export const ProtectedMessage: React.FC<Props> = ({ info }) => {
  return (
    info.protected && (
      <HelperText>
        <HelperTextItem variant="warning">
          {info.protected_by && words("settings.protected.message")(info.protected_by)}
          {!info.protected_by && words("settings.protected.message.default")}
        </HelperTextItem>
      </HelperText>
    )
  );
};
