import { EnvironmentSettings } from "@/Core";
import { Form, FormGroup } from "@patternfly/react-core";
import React, { useState } from "react";

interface Props {
  settings: EnvironmentSettings.EnvironmentSettings;
}

export const Container: React.FC<Props> = ({
  settings: { settings, definition },
}) => {
  const [values, setValues] = useState(settings);
  const infos = settingsToInfos(definition, values, setValues).sort(sortInfos);
  return (
    <Form>
      {infos.map((info) => (
        <FormGroup key={info.name} fieldId={info.name}>
          <Input info={info} />
        </FormGroup>
      ))}
    </Form>
  );
};

const Input: React.FC<{ info: EnvironmentSettings.InputInfo }> = ({ info }) => {
  switch (info.type) {
    case "bool":
      return <>{info.name} (bool)</>;
    case "int":
      return <>{info.name} int</>;
    case "enum":
      return <>{info.name} enum</>;
    case "dict":
      return <>{info.name} dict</>;
  }
};

function settingsToInfos(
  definitionMap: EnvironmentSettings.DefinitionMap,
  values: EnvironmentSettings.ValuesMap,
  setValues: (values: EnvironmentSettings.ValuesMap) => void
): EnvironmentSettings.InputInfo[] {
  return Object.values(definitionMap).map((definition) =>
    definitionToInputInfo(definition, values[definition.name], (value) =>
      setValues({ ...values, [definition.name]: value })
    )
  );
}

function sortInfos(
  a: EnvironmentSettings.InputInfo,
  b: EnvironmentSettings.InputInfo
): number {
  return a.name < b.name ? -1 : 1;
}

function definitionToInputInfo(
  definition: EnvironmentSettings.Definition,
  value: EnvironmentSettings.Value,
  setValue: (value: EnvironmentSettings.Value) => void
): EnvironmentSettings.InputInfo {
  switch (definition.type) {
    case "bool":
      return {
        ...definition,
        type: "bool",
        value: value as boolean,
        set: (value) => setValue(value),
      };
    case "int":
      return {
        ...definition,
        type: "int",
        value: value as number,
        set: (value) => setValue(value),
      };
    case "enum":
      return {
        ...definition,
        type: "enum",
        value: value as string,
        set: (value) => setValue(value),
      };
    case "dict":
      return {
        ...definition,
        type: "dict",
        value: value as EnvironmentSettings.Dict,
        set: (value) => setValue(value),
      };
  }
}
