import React from "react";
import { NumberInput } from "@patternfly/react-core";
import styled from "styled-components";
import { EnvironmentSettings } from "@/Core";
import { Warning } from "./Warning";

interface Props {
  // TODO: differentiate between float and int
  info:
    | EnvironmentSettings.IntInputInfo
    | EnvironmentSettings.PositiveFloatInputInfo;
}

export const IntInput: React.FC<Props> = ({ info }) => {
  const onChange = (event) => {
    info.set(Number(event.target.value));
  };
  const onMinus = () => info.set(Number(info.value) - 1);
  const onPlus = () => info.set(Number(info.value) + 1);

  return (
    <>
      <NumberInput
        value={Number(info.value)}
        onMinus={onMinus}
        onChange={onChange}
        onPlus={onPlus}
        inputName="input"
        inputAriaLabel="number input"
        minusBtnAriaLabel="minus"
        plusBtnAriaLabel="plus"
        widthChars={10}
      />
      {info.isUpdateable(info) && <StyledWarning />}
    </>
  );
};

const StyledWarning = styled(Warning)`
  height: 36px;
  margin-left: 16px;
`;
