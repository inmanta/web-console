import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { EnvironmentSettings } from "@/Core";
import { DependencyContext } from "@/UI";
import {
  Alert,
  AlertActionCloseButton,
  Form,
  FormAlert,
  FormGroup,
} from "@patternfly/react-core";
import { Input } from "./Input";
import { InputInfoCreator } from "./InputInfoCreator";

interface Props {
  settings: EnvironmentSettings.EnvironmentSettings;
}

export const Container: React.FC<Props> = ({
  settings: { settings, definition },
}) => {
  const [values, setValues] = useState(settings);
  const [errorMessage, setErrorMessage] = useState("");
  const { commandResolver } = useContext(DependencyContext);
  const updateSetting = commandResolver.getTrigger<"UpdateEnvironmentSetting">({
    kind: "UpdateEnvironmentSetting",
  });
  const resetSetting = commandResolver.getTrigger<"ResetEnvironmentSetting">({
    kind: "ResetEnvironmentSetting",
  });
  const infos = new InputInfoCreator(
    setValues,
    updateSetting,
    resetSetting,
    setErrorMessage
  ).create(settings, definition, values);

  useEffect(() => {
    setValues(settings);
  }, [settings]);

  return (
    <PaddedForm>
      {errorMessage && (
        <FormAlert>
          <Alert
            variant="danger"
            title={errorMessage}
            aria-live="polite"
            actionClose={
              <AlertActionCloseButton onClose={() => setErrorMessage("")} />
            }
            isInline
          />
        </FormAlert>
      )}
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
    </PaddedForm>
  );
};

const PaddedForm = styled(Form)`
  padding-top: 1rem;
`;
