import React from "react";
import { EnvironmentSettings } from "@/Core";
import { NumberInput } from "@patternfly/react-core";

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
    <NumberInput
      value={info.value}
      onMinus={onMinus}
      onChange={onChange}
      onPlus={onPlus}
      inputName="input"
      inputAriaLabel="number input"
      minusBtnAriaLabel="minus"
      plusBtnAriaLabel="plus"
      widthChars={10}
    />
  );
};
