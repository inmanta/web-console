import React, { PropsWithChildren } from "react";
import { Panel } from "@patternfly/react-core";
import { InfoAltIcon } from "@patternfly/react-icons";
import { AppAlert } from "../AppAlert";

interface Props {
  title: string;
}

/**
 *  A component that displays an error message
 *
 * @param {string} title - The title of the error message
 * @param {ReactNode} children - The children of the error message
 * @returns {ReactElement} The error message component
 */
export const ErrorMessageContainer: React.FC<PropsWithChildren<Props>> = ({ children, title }) => {
  return (
    <Panel data-testid="Error-container">
      <AppAlert isInline customIcon={<InfoAltIcon />} isExpandable title={title}>
        {children}
      </AppAlert>
    </Panel>
  );
};
