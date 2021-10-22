import React from "react";
import styled from "styled-components";
import { NumberInput, Switch } from "@patternfly/react-core";
import { EnvironmentSettings } from "@/Core";
import { DictEditor, SingleTextSelect } from "@/UI/Components";

interface Props {
  info: EnvironmentSettings.InputInfo;
}

export const Input: React.FC<Props> = ({ info }) => {
  switch (info.type) {
    case "bool":
      return <BooleanInput info={info} />;
    case "int":
      return <IntInput info={info} />;
    case "enum":
      return <EnumInput info={info} />;
    case "dict":
      return <DictInput info={info} />;
  }
};

const EnumInput: React.FC<{ info: EnvironmentSettings.EnumInputInfo }> = ({
  info,
}) => {
  const setSelected = (value) => (value !== null ? info.set(value) : undefined);
  return (
    <StyledSingleTextSelect
      selected={info.value}
      setSelected={setSelected}
      options={info.allowed_values}
    />
  );
};

const StyledSingleTextSelect = styled(SingleTextSelect)`
  width: 300px;
`;

const IntInput: React.FC<{ info: EnvironmentSettings.IntInputInfo }> = ({
  info,
}) => {
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

const BooleanInput: React.FC<{
  info: EnvironmentSettings.BooleanInputInfo;
}> = ({ info }) => (
  <Switch isChecked={info.value} onChange={info.set} aria-label={info.name} />
);

const DictInput: React.FC<{
  info: EnvironmentSettings.DictInputInfo;
}> = ({ info }) => {
  return <DictEditor value={info.value} setValue={info.set} />;
};
