import React, { PropsWithChildren } from 'react';
import { Alert, Panel } from '@patternfly/react-core';
import { InfoAltIcon } from '@patternfly/react-icons';

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
export const ErrorMessageContainer: React.FC<PropsWithChildren<Props>> = ({
  children,
  title,
}) => {
  return (
    <Panel data-testid="Error-container">
      <Alert
        isInline
        customIcon={<InfoAltIcon />}
        isExpandable
        variant="danger"
        title={title}
      >
        {children}
      </Alert>
    </Panel>
  );
};
