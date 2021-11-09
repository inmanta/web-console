import React, { useContext } from "react";
import { useHistory } from "react-router";
import { DependencyContext } from "@/UI/Dependency/Dependency";
import {
  EnvironmentHandlerContext,
  EnvironmentHandlerImpl,
} from "./EnvironmentHandler";

export const EnvironmentHandlerProvider: React.FC = ({ children }) => {
  const { routeManager } = useContext(DependencyContext);
  const history = useHistory();
  const environmentHandler = new EnvironmentHandlerImpl(history, routeManager);
  return (
    <EnvironmentHandlerContext.Provider value={{ environmentHandler }}>
      {children}
    </EnvironmentHandlerContext.Provider>
  );
};
