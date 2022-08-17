import React from "react";
import { TextInput } from "@patternfly/react-core";
import styled from "styled-components";
import { EnvironmentSettings } from "@/Core";
import { Warning } from "./Warning";

interface Props {
  info: EnvironmentSettings.StrInputInfo;
}

export const StringInput: React.FC<Props> = ({ info }) => {
  return (
    <Container hasWarning={info.isUpdateable(info)}>
      <TextInput
        value={info.value}
        onChange={info.set}
        aria-label="string input"
        type="text"
      />
      {info.isUpdateable(info) && <StyledWarning />}
    </Container>
  );
};

const StyledWarning = styled(Warning)`
  height: 36px;
  margin-left: 16px;
`;
const Container = styled.div<{ hasWarning: boolean }>`
  display: flex;
  margin-right: ${(p) => (p.hasWarning ? "0" : "16px")};
`;
