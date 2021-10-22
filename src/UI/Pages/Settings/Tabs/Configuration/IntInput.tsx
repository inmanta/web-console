import React from "react";
import { EnvironmentSettings } from "@/Core";
import { InputGroup, NumberInput } from "@patternfly/react-core";
import {
  InputDefaultStatus,
  InputResetAction,
  InputUpdateAction,
} from "./InputActions";

interface Props {
  info: EnvironmentSettings.IntInputInfo;
}

export const IntInput: React.FC<Props> = ({ info }) => {
  const onChange = (event) => {
    info.set(Number(event.target.value));
  };
  const onMinus = () => info.set(info.value - 1);
  const onPlus = () => info.set(info.value + 1);

  return (
    <InputGroup>
      <NumberInput
        value={info.value}
        onMinus={onMinus}
        onChange={onChange}
        onPlus={onPlus}
        inputName="input"
        inputAriaLabel="number input"
        minusBtnAriaLabel="minus"
        plusBtnAriaLabel="plus"
        widthChars={info.value.toString().length + 3}
      />
      <InputDefaultStatus info={info} />
      <InputUpdateAction info={info} />
      <InputResetAction info={info} />
    </InputGroup>
  );
};
