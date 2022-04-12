import React from "react";
import { Switch } from "@patternfly/react-core";
import styled from "styled-components";
import { EnvironmentSettings } from "@/Core";
import { Warning } from "./Warning";

interface Props {
  info: EnvironmentSettings.BooleanInputInfo;
}

export const BooleanInput: React.FC<Props> = ({ info }) => (
  <Container>
    <Switch
      isChecked={info.value}
      onChange={info.set}
      aria-label={`Toggle-${info.name}`}
    />
    {info.isUpdateable(info) && <StyledWarning />}
  </Container>
);

const StyledWarning = styled(Warning)`
  margin-left: 16px;
`;

const Container = styled.div`
  display: inline-flex;
  align-items: center;
  vertical-align: bottom;
`;
