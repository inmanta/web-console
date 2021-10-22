import React from "react";
import styled from "styled-components";
import { EnvironmentSettings } from "@/Core";
import { SingleTextSelect } from "@/UI/Components";

interface Props {
  info: EnvironmentSettings.EnumInputInfo;
}

export const EnumInput: React.FC<Props> = ({ info }) => {
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
