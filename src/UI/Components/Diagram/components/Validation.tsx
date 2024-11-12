import React, { useContext } from "react";
import { Alert, Panel } from "@patternfly/react-core";
import { InfoAltIcon } from "@patternfly/react-icons";
import styled from "styled-components";
import { words } from "@/UI/words";
import { CanvasContext } from "../Context";

export const Validation = () => {
  const { isDirty, interServiceRelationsOnCanvas } = useContext(CanvasContext);

  const interServiceRelationsThatAreMissing = Array.from(
    interServiceRelationsOnCanvas,
  ).filter(
    ([_key, value]) =>
      value.min !== undefined &&
      value.min !== null &&
      value.current < value.min,
  );

  //dirty flag is set to false on initial load for edited instances, that solves issue of flickering as we are starting canvas from empty state and populate it from ground up
  if (interServiceRelationsThatAreMissing.length === 0 || !isDirty) {
    return null;
  }

  return (
    <PanelWrapper variant="bordered" data-testid="Error-container">
      <Alert
        isInline
        customIcon={<InfoAltIcon />}
        isExpandable
        variant="danger"
        title={words("instanceComposer.missingRelations")(
          interServiceRelationsThatAreMissing.length,
        )}
      >
        {interServiceRelationsThatAreMissing.map(([relationName, value]) => (
          <p
            key={relationName}
          >{`${relationName}: ${Number(value.min) - value.current}`}</p>
        ))}
      </Alert>
    </PanelWrapper>
  );
};

const PanelWrapper = styled(Panel)`
  min-height: 55px;
  margin-top: var(--pf-v5-global--spacer--sm);
`;
