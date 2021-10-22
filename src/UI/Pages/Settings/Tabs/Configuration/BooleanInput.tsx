import React from "react";
import styled from "styled-components";
import { EnvironmentSettings } from "@/Core";
import { InputGroup, Switch } from "@patternfly/react-core";
import {
  InputDefaultStatus,
  InputResetAction,
  InputUpdateAction,
} from "./InputActions";

interface Props {
  info: EnvironmentSettings.BooleanInputInfo;
}

export const BooleanInput: React.FC<Props> = ({ info }) => {
  return (
    <InputGroup>
      <PaddedSwitch isChecked={info.value} onChange={info.set} />
      <InputDefaultStatus info={info} />
      <InputUpdateAction info={info} />
      <InputResetAction info={info} />
    </InputGroup>
  );
};

const PaddedSwitch = styled(Switch)`
  margin: 6px;
`;
