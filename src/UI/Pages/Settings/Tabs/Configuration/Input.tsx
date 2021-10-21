import React from "react";
import { EnvironmentSettings } from "@/Core";
import { NumberInput } from "@patternfly/react-core";

interface Props {
  info: EnvironmentSettings.InputInfo;
}

export const Input: React.FC<Props> = ({ info }) => {
  switch (info.type) {
    case "bool":
      return <>{info.name} (bool)</>;
    case "int":
      return <IntInput info={info} />;
    case "enum":
      return <>{info.name} enum</>;
    case "dict":
      return <>{info.name} dict</>;
  }
};

interface IntProps {
  info: EnvironmentSettings.IntInputInfo;
}

const IntInput: React.FC<IntProps> = ({ info }) => {
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
      widthChars={info.value.toString().length + 1}
    />
  );
};
