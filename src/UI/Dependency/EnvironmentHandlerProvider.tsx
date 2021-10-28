import React, { useContext, useEffect } from "react";
import { useHistory } from "react-router";
import { useStore } from "@/Data/Store";
import {
  EnvironmentHandlerContext,
  EnvironmentHandlerImpl,
} from "./EnvironmentHandler";
import { DependencyContext } from "./Dependency";

export const EnvironmentHandlerProvider: React.FC = ({ children }) => {
  const { queryResolver, routeManager } = useContext(DependencyContext);
  const history = useHistory();
  const store = useStore();
  const environmentHandler = new EnvironmentHandlerImpl(
    history,
    store,
    routeManager
  );
  const [data] = queryResolver.useOneTime<"GetProjects">({
    kind: "GetProjects",
  });
  useEffect(() => {
    environmentHandler.setDefault(data);
  }, [data]); /* eslint-disable-line react-hooks/exhaustive-deps */
  return (
    <EnvironmentHandlerContext.Provider value={{ environmentHandler }}>
      {children}
    </EnvironmentHandlerContext.Provider>
  );
};
