import {
  EnvironmentHandlerContext,
  EnvironmentHandlerImpl,
  RootDependencyManagerContext,
} from "@/UI/Dependency";
import { useStore } from "@/UI/Store";
import {
  Alert,
  AlertActionCloseButton,
  AlertGroup,
  AlertVariant,
} from "@patternfly/react-core";
import React, { useContext, useEffect } from "react";
import { useHistory } from "react-router";

export const EnvironmentHandlerProvider: React.FC = ({ children }) => {
  const [envAlert, setEnvAlert] = React.useState("");
  const dependencyManager = useContext(RootDependencyManagerContext);
  const dependencies = dependencyManager.getEnvironmentIndependentDependencies();
  const history = useHistory();
  const store = useStore();
  const environmentHandler = new EnvironmentHandlerImpl(history, store);
  const [data] = dependencies.projectsProvider.useOneTime<"Projects">({
    kind: "Projects",
    qualifier: null,
  });
  useEffect(() => {
    environmentHandler.setDefault(data, setEnvAlert);
  }, [data]);
  // The alert can be removed after the environment selector landing page is implemented
  return (
    <EnvironmentHandlerContext.Provider
      value={{ environmentHandler, projects: data }}
    >
      <>
        {envAlert && (
          <AlertGroup isToast={true}>
            <Alert
              isLiveRegion={true}
              variant={AlertVariant["warning"]}
              title={envAlert}
              id="env-warning-alert"
              actionClose={
                <AlertActionCloseButton
                  title="Close environment warning"
                  id="close-env-warning-button"
                  variantLabel={`warning alert`}
                  onClose={() => setEnvAlert("")}
                />
              }
            />
          </AlertGroup>
        )}
        {children}
      </>
    </EnvironmentHandlerContext.Provider>
  );
};
