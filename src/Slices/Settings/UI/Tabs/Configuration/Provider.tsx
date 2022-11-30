import React, { useContext, useEffect, useState } from "react";
import { EnvironmentSettings } from "@/Core";
import { DependencyContext } from "@/UI/Dependency";
import { Container } from "./Container";
import { InputInfoCreator } from "./InputInfoCreator";

interface Props {
  settings: EnvironmentSettings.EnvironmentSettings;
}

export const Provider: React.FC<Props> = ({
  settings: { settings, definition },
}) => {
  const [values, setValues] = useState(settings);
  const [errorMessage, setErrorMessage] = useState("");
  const { commandResolver } = useContext(DependencyContext);
  const updateSetting =
    commandResolver.useGetTrigger<"UpdateEnvironmentSetting">({
      kind: "UpdateEnvironmentSetting",
    });
  const resetSetting = commandResolver.useGetTrigger<"ResetEnvironmentSetting">(
    {
      kind: "ResetEnvironmentSetting",
    }
  );
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
    <Container
      infos={infos}
      errorMessage={errorMessage}
      onErrorClose={() => setErrorMessage("")}
    />
  );
};
