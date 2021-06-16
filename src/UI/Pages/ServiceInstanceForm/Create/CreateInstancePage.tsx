import React, { useCallback, useContext, useState } from "react";
import {
  Alert,
  AlertActionCloseButton,
  AlertGroup,
} from "@patternfly/react-core";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { FormAttributeResult, RemoteData, ServiceModel } from "@/Core";
import { words } from "@/UI/words";
import { DependencyContext } from "@/UI/Dependency";
import { Route } from "@/UI/Routing";
import { CreateFormCard } from "./CreateFormCard";
import { PageSectionWithTitle, ErrorView, LoadingView } from "@/UI/Components";

export const CreateInstancePageWithProvider: React.FC = () => {
  const { service: serviceName } = useParams<Route.Params<"CreateInstance">>();
  const { queryResolver } = useContext(DependencyContext);

  const [data, retry] = queryResolver.useContinuous<"Service">({
    kind: "Service",
    name: serviceName,
  });

  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => (
        <PageWrapper aria-label="AddInstance-Loading">
          <LoadingView />
        </PageWrapper>
      ),
      failed: (error) => (
        <PageWrapper aria-label="AddInstance-Failed">
          <ErrorView message={error} retry={retry} />
        </PageWrapper>
      ),
      success: (service) => (
        <PageWrapper aria-label="AddInstance-Success">
          <CreateInstancePage serviceEntity={service} />
        </PageWrapper>
      ),
    },
    data
  );
};

const PageWrapper: React.FC<{ "aria-label": string }> = ({
  children,
  ...props
}) => (
  <PageSectionWithTitle
    {...props}
    title={words("inventory.createInstance.title")}
  >
    {children}
  </PageSectionWithTitle>
);

export const CreateInstancePage: React.FC<{ serviceEntity: ServiceModel }> = ({
  serviceEntity,
}) => {
  const { commandResolver } = useContext(DependencyContext);
  const [errorMessage, setErrorMessage] = useState("");
  const location = useLocation();
  const pathParts = location.pathname.split("/");
  pathParts.pop();
  const inventoryPath = pathParts.join("/").concat(location.search);
  const history = useHistory();
  const handleRedirect = useCallback(
    () => history.push(`${inventoryPath}`),
    [history]
  );

  const trigger = commandResolver.getTrigger<"CreateInstance">({
    kind: "CreateInstance",
    service_entity: serviceEntity.name,
  });

  const onSubmit = async (attributes: FormAttributeResult[]) => {
    const result = await trigger(attributes);
    if (result.kind === "Left") {
      setErrorMessage(result.value);
    } else {
      handleRedirect();
    }
  };

  return (
    <>
      {errorMessage && (
        <AlertGroup isToast>
          <Alert
            variant={"danger"}
            title={errorMessage}
            actionClose={
              <AlertActionCloseButton onClose={() => setErrorMessage("")} />
            }
          />
        </AlertGroup>
      )}
      <CreateFormCard
        serviceEntity={serviceEntity}
        handleRedirect={handleRedirect}
        onSubmit={onSubmit}
      />
    </>
  );
};
