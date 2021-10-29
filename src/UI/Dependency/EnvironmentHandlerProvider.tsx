import {
  EnvironmentHandlerContext,
  EnvironmentHandlerImpl,
} from "./EnvironmentHandler";
import React from "react";
import { useHistory } from "react-router";

export const EnvironmentHandlerProvider: React.FC = ({ children }) => {
  const history = useHistory();
  const environmentHandler = new EnvironmentHandlerImpl(history);
  return (
    <EnvironmentHandlerContext.Provider value={{ environmentHandler }}>
      {children}
    </EnvironmentHandlerContext.Provider>
  );
};
