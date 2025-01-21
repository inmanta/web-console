import React, { PropsWithChildren } from "react";
import { Alert, Panel } from "@patternfly/react-core";
import { InfoAltIcon } from "@patternfly/react-icons";

interface Props {
  title: string;
}
const Validation: React.FC<PropsWithChildren<Props>> = ({
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

export default Validation;
