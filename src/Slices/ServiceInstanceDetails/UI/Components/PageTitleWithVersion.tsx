import React, { useContext } from "react";
import { Label } from "@patternfly/react-core";
import { InfoAltIcon } from "@patternfly/react-icons";
import styled from "styled-components";
import { useUrlStateWithString } from "@/Data";
import { InstanceContext } from "../../Core/Context";

export const PageTitleWithVersion: React.FC<{ title: string }> = ({
  title,
}) => {
  const { instance } = useContext(InstanceContext);

  const [selectedVersion] = useUrlStateWithString<string>({
    default: String(instance.version),
    key: `version`,
    route: "InstanceDetails",
  });

  const isLatest = selectedVersion === String(instance.version);

  return (
    <>
      {title}
      <LabelContainer>
        <Label data-testid="selected-version">Version: {selectedVersion}</Label>
        {isLatest && (
          <Label color="green" icon={<InfoAltIcon />}>
            Latest Version
          </Label>
        )}
      </LabelContainer>
    </>
  );
};

const LabelContainer = styled.span`
  margin-left: var(--pf-v5-global--spacer--md);
  display: inline-flex;
  gap: var(--pf-v5-global--spacer--sm);
`;
