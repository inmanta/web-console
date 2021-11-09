import React, { useContext } from "react";
import { useHistory } from "react-router";
import {
  EnvironmentHandlerContext,
  EnvironmentHandlerImpl,
} from "./EnvironmentHandler";
import { DependencyContext } from "@/UI/Dependency/Dependency";

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
