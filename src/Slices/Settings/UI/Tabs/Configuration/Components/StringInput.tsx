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
    <>
      <TextInput
        value={info.value}
        onChange={info.set}
        aria-label="string input"
        type="text"
      />
      {info.isUpdateable(info) && <StyledWarning />}
    </>
  );
};

const StyledWarning = styled(Warning)`
  height: 36px;
  margin-left: 16px;
`;
