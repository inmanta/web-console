import {
  EnvironmentHandlerContext,
  EnvironmentHandlerImpl,
} from "./EnvironmentHandler";
import { DependencyContext } from "./Dependency";
import { useStore } from "@/Data";
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
  const { queryResolver } = useContext(DependencyContext);
  const history = useHistory();
  const store = useStore();
  const environmentHandler = new EnvironmentHandlerImpl(history, store);
  const [data] = queryResolver.useOneTime<"Projects">({ kind: "Projects" });
  useEffect(() => {
    environmentHandler.setDefault(data, setEnvAlert);
  }, [data]);
  return (
    <EnvironmentHandlerContext.Provider value={{ environmentHandler }}>
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
