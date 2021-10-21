import { EnvironmentSettings, Maybe } from "@/Core";
import { Form, FormGroup } from "@patternfly/react-core";
import React, { useState } from "react";
import { Input } from "./Input";
import { InputInfoCreator } from "./InputInfoCreator";

interface Props {
  settings: EnvironmentSettings.EnvironmentSettings;
}

export const Container: React.FC<Props> = ({
  settings: { settings, definition },
}) => {
  const [values, setValues] = useState(settings);
  const updateSetting = async () => Maybe.none();
  const resetSetting = async () => Maybe.none();
  const infos = new InputInfoCreator(
    setValues,
    updateSetting,
    resetSetting
  ).create(definition, values);

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
