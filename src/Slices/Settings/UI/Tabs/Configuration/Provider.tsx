import React, { useContext, useEffect, useReducer, useState } from "react";
import _ from "lodash";
import { EnvironmentSettings } from "@/Core";
import { DependencyContext } from "@/UI/Dependency";
import { Container } from "./Container";
import { InputInfoCreator } from "./InputInfoCreator";

interface Props {
  settings: EnvironmentSettings.EnvironmentSettings;
}
function reducer(
  state: { settings: EnvironmentSettings.ValuesMap; resetedValueName: string },
  action: {
    type: string;
    payload: EnvironmentSettings.ValuesMap | string;
  },
) {
  const { type, payload } = action;
  switch (type) {
    case "reset":
      return {
        settings: state.settings,
        resetedValueName: payload as string,
      };
    case "update":
      const copy = JSON.parse(JSON.stringify(state.settings));
      if (state.resetedValueName !== "") {
        delete copy[state.resetedValueName];
      }
      return {
        settings: _.merge({}, JSON.parse(JSON.stringify(payload)), copy),
        resetedValueName: "",
      };
    case "set":
      return { ...state, settings: payload };
    default:
      return state;
  }
}

export const Provider: React.FC<Props> = ({
  settings: { settings, definition },
}) => {
  /*
  useReducer in this component is used due to dependency issues in useEffect, 
  to keep track of unsaved changes we had to add logic that was updating the state 
  through mentioned hook and having state in the dependency array and altering it there is against 
  React's rules as it results in infinite re-renders
  */
  const [state, dispatch] = useReducer(reducer, {
    settings: settings,
    resetedValueName: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const { commandResolver } = useContext(DependencyContext);
  const updateSetting =
    commandResolver.useGetTrigger<"UpdateEnvironmentSetting">({
      kind: "UpdateEnvironmentSetting",
    });
  const resetSetting = commandResolver.useGetTrigger<"ResetEnvironmentSetting">(
    {
      kind: "ResetEnvironmentSetting",
    },
  );
  const handleReset = (id: string) => {
    dispatch({ type: "reset", payload: id });
    return resetSetting(id);
  };
  const infos = new InputInfoCreator(
    (values: EnvironmentSettings.ValuesMap) => {
      dispatch({ type: "set", payload: values });
    },
    updateSetting,
    handleReset,
    setErrorMessage,
  ).create(settings, definition, state.settings);

  useEffect(() => {
    dispatch({ type: "update", payload: settings });
  }, [settings]);
  return (
    <Container
      infos={infos}
      errorMessage={errorMessage}
      onErrorClose={() => setErrorMessage("")}
    />
  );
};
