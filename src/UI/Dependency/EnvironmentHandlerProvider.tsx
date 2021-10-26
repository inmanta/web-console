import {
  EnvironmentHandlerContext,
  EnvironmentHandlerImpl,
} from "./EnvironmentHandler";
import { DependencyContext } from "./Dependency";
import { useStore } from "@/Data";
import React, { useContext, useEffect } from "react";
import { useHistory } from "react-router";

export const EnvironmentHandlerProvider: React.FC = ({ children }) => {
  const { queryResolver } = useContext(DependencyContext);
  const history = useHistory();
  const store = useStore();
  const environmentHandler = new EnvironmentHandlerImpl(history, store);
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
