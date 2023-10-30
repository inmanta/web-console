import React from "react";
import { SelectOptionProps } from "@patternfly/react-core";
import styled from "styled-components";
import { EnvironmentSettings } from "@/Core";
import { SingleTextSelect } from "@/UI/Components";
import { Warning } from "./Warning";

interface Props {
  info: EnvironmentSettings.EnumInputInfo;
}

export const EnumInput: React.FC<Props> = ({ info }) => {
  const setSelected = (value) => (value !== null ? info.set(value) : undefined);
  const options: SelectOptionProps[] = info.allowed_values.map((option) => {
    return { value: option, children: option };
  });

  return (
    <>
      <StyledSingleTextSelect
        selected={info.value}
        setSelected={setSelected}
        options={options}
        toggleAriaLabel={`EnumInput-${info.name}`}
      />
      {info.isUpdateable(info) && <StyledWarning />}
    </>
  );
};

const StyledWarning = styled(Warning)`
  height: 36px;
  margin-left: 16px;
`;

const StyledSingleTextSelect = styled(SingleTextSelect)`
  width: 300px;
`;
