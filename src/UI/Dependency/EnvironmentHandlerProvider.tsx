import {
  EnvironmentHandlerContext,
  EnvironmentHandlerImpl,
  DependencyContext,
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
  const { dataProvider } = useContext(DependencyContext);
  const history = useHistory();
  const store = useStore();
  const environmentHandler = new EnvironmentHandlerImpl(history, store);
  const [data] = dataProvider.useOneTime<"Projects">({
    kind: "Projects",
    qualifier: null,
  });
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
