import React, { useEffect, useReducer, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import _ from "lodash";
import { EnvironmentSettings } from "@/Core";
import {
  useResetEnvironmentSetting,
  useUpdateEnvironmentSetting,
  getEnvironmentSettingsKey,
  GetEnvironmentPreviewKey,
} from "@/Data/Queries";
import { Container } from "./Container";
import { InputInfoCreator } from "./InputInfoCreator";

interface Props {
  settings: EnvironmentSettings.EnvironmentSettings;
}

/**
 * Reducer function for the Environment Settings tab
 *
 * @param state - The current state of the environment settings
 * @param action - The action to be performed
 * @returns The new state of the environment settings
 */
function reducer(
  state: { settings: EnvironmentSettings.ValuesMap; resetedValueName: string },
  action: {
    type: string;
    payload: EnvironmentSettings.ValuesMap | string;
  }
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

/**
 * Provider component for the Environment Settings tab
 *
 * @param props - The props for the Environment Settings tab
 * @returns The Environment Settings tab
 */
export const Provider: React.FC<Props> = ({ settings: { settings, definition } }) => {
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
  const client = useQueryClient();
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const updateSetting = useUpdateEnvironmentSetting({
    onSuccess: () => {
      client.refetchQueries({ queryKey: getEnvironmentSettingsKey.root() });
      client.refetchQueries({ queryKey: GetEnvironmentPreviewKey.root() });
      document.dispatchEvent(new Event("settings-update"));
      setErrorMessage("");
      setShowUpdateBanner(true);
      setTimeout(() => {
        setShowUpdateBanner(false);
      }, 2000);
    },
    onError: (error) => setErrorMessage(error.message),
  });

  const resetSetting = useResetEnvironmentSetting({
    onSuccess: () => {
      setErrorMessage("");
      client.refetchQueries({ queryKey: getEnvironmentSettingsKey.root() });
    },
    onError: (error) => setErrorMessage(error.message),
  });

  const handleReset = (id: string) => {
    dispatch({ type: "reset", payload: id });
    return resetSetting.mutate(id);
  };

  const handleUpdate = (id: string, value: EnvironmentSettings.Value) => {
    dispatch({ type: "update", payload: { [id]: value } });
    return updateSetting.mutate({ id, value });
  };

  const updateSuccessBanner = (value: boolean) => {
    setShowUpdateBanner(value);
  };

  const infos = new InputInfoCreator(
    (values: EnvironmentSettings.ValuesMap) => {
      dispatch({ type: "set", payload: values });
    },
    handleUpdate,
    handleReset
  ).create(settings, definition, state.settings);

  useEffect(() => {
    dispatch({ type: "update", payload: settings });
  }, [settings]);

  return (
    <Container
      infos={infos}
      errorMessage={errorMessage}
      onErrorClose={() => setErrorMessage("")}
      showUpdateBanner={showUpdateBanner}
      setShowUpdateBanner={updateSuccessBanner}
    />
  );
};
