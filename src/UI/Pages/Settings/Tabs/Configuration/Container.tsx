import { EnvironmentSettings } from "@/Core";
import { Form, FormGroup } from "@patternfly/react-core";
import React, { useState } from "react";
import { Input } from "./Input";

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
        <FormGroup
          key={info.name}
          fieldId={info.name}
          helperText={info.doc}
          label={info.name}
        >
          <Input info={info} />
        </FormGroup>
      ))}
    </Form>
  );
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
  value: EnvironmentSettings.Value | undefined,
  setValue: (value: EnvironmentSettings.Value) => void
): EnvironmentSettings.InputInfo {
  switch (definition.type) {
    case "bool":
      return {
        ...definition,
        type: "bool",
        value: undefinedFallback(value, definition.default),
        set: (value) => setValue(value),
      };
    case "int":
      return {
        ...definition,
        type: "int",
        value: undefinedFallback(value, definition.default),
        set: (value) => setValue(value),
      };
    case "enum":
      return {
        ...definition,
        type: "enum",
        value: undefinedFallback(value, definition.default),
        set: (value) => setValue(value),
      };
    case "dict":
      return {
        ...definition,
        type: "dict",
        value: undefinedFallback(
          value,
          definition.default as EnvironmentSettings.Dict
        ),
        set: (value) => setValue(value),
      };
  }
}

function undefinedFallback<V>(value: unknown | undefined, fallback: V): V {
  return typeof value === "undefined" ? fallback : (value as V);
}
