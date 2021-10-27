import React, { useContext, useEffect, useState } from "react";
import { EnvironmentSettings } from "@/Core";
import { DependencyContext } from "@/UI/Dependency";
import { InputInfoCreator } from "./InputInfoCreator";
import { Container } from "./Container";

interface Props {
  settings: EnvironmentSettings.EnvironmentSettings;
}

export const Provider: React.FC<Props> = ({
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
    <Container
      infos={infos}
      errorMessage={errorMessage}
      onErrorClose={() => setErrorMessage("")}
    />
  );
};
