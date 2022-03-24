import React from "react";
import styled from "styled-components";
import { EnvironmentSettings, Maybe } from "@/Core";
import { Container } from "./Container";

export default {
  title: "Settings Page/Configuration Tab/Container",
  component: Container,
  parameters: {
    layout: "fullscreen",
  },
};

export const Default = () => {
  const base = {
    recompile: false,
    update_model: false,
    agent_restart: false,
    set: (value) => alert(value),
    update: async () => Maybe.none(),
    reset: async () => Maybe.none(),
    isUpdateable: () => true,
  };

  const enumInfo: EnvironmentSettings.EnumInputInfo = {
    ...base,
    name: "name",
    doc: "description",
    type: "enum",
    initial: "test",
    value: "test",
    default: "test",
    allowed_values: ["test", "test2"],
  };

  const booleanInfo: EnvironmentSettings.BooleanInputInfo = {
    ...base,
    name: "name",
    doc: "description",
    type: "bool",
    initial: false,
    value: true,
    default: false,
  };

  const intInfo: EnvironmentSettings.IntInputInfo = {
    ...base,
    name: "name",
    doc: "description",
    type: "int",
    initial: 12,
    value: 12,
    default: 12,
  };

  const dictInfo: EnvironmentSettings.DictInputInfo = {
    ...base,
    name: "name",
    doc: "description",
    type: "dict",
    initial: { key: "value" },
    value: { key: "value" },
    default: { key: "value" },
  };

  return (
    <StyledContainer
      infos={[enumInfo, booleanInfo, intInfo, dictInfo]}
      errorMessage={""}
      onErrorClose={() => undefined}
    />
  );
};

const StyledContainer = styled(Container)`
  height: 100vh;
`;
