import { Query, RemoteData, ServiceModel } from "@/Core";
import {
  Alert,
  AlertGroup,
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  PageSection,
  Spinner,
  Title,
} from "@patternfly/react-core";
import { ExclamationCircleIcon } from "@patternfly/react-icons";
import React, { useCallback, useContext, useState } from "react";
import { useKeycloak } from "react-keycloak";
import { useHistory, useLocation } from "react-router-dom";
import { ServicesContext, useStoreState, words } from "../..";
import { CreateFormCard } from "./CreateFormCard";

export const CreateInstancePageWithProvider: React.FunctionComponent<{
  match: { params: { id: string } };
}> = ({ match }) => {
  const environmentId = useStoreState(
    (store) => store.environments.getSelectedEnvironment.id
  );

  return environmentId ? (
    <ServiceProvider
      serviceName={match.params.id}
      environmentId={environmentId}
    />
  ) : (
    <ErrorView error={words("error.environment.missing")} />
  );
};

const ServiceProvider: React.FunctionComponent<{
  serviceName: string;
  environmentId: string;
}> = ({ serviceName, environmentId }) => {
  const { dataProvider } = useContext(ServicesContext);
  const query: Query.ServiceQuery = {
    kind: "Service",
    qualifier: { name: serviceName, environment: environmentId },
  };
  dataProvider.useSubscription(query);
  const data = dataProvider.useData<"Service">(query);

  return RemoteData.fold<
    Query.Error<"Service">,
    Query.Data<"Service">,
    JSX.Element | null
  >({
    notAsked: () => null,
    loading: () => <LoadingView />,
    failed: (error) => (
      <ErrorView error={error} retry={() => dataProvider.trigger(query)} />
    ),
    success: (service) => (
      <PageWrapper aria-label="AddInstance-Success">
        <CreateInstancePage serviceEntity={service} />
      </PageWrapper>
    ),
  })(data);
};

const LoadingView: React.FC = () => (
  <PageWrapper aria-label="AddInstance-Loading">
    <EmptyState>
      <EmptyStateIcon variant="container" component={Spinner} />
      <Title size="lg" headingLevel="h4">
        {words("loading")}
      </Title>
    </EmptyState>
  </PageWrapper>
);

const ErrorView: React.FC<{ error: string; retry?: () => void }> = ({
  error,
  retry,
}) => (
  <PageWrapper aria-label="AddInstance-Failed">
    <EmptyState>
      <EmptyStateIcon icon={ExclamationCircleIcon} />
      <Title headingLevel="h4" size="lg">
        {words("error")}
      </Title>
      <EmptyStateBody>{error}</EmptyStateBody>
      <Button variant="primary" onClick={retry}>
        {words("retry")}
      </Button>
    </EmptyState>
  </PageWrapper>
);

const PageWrapper: React.FC<{ "aria-label": string }> = ({
  children,
  ...props
}) => <PageSection aria-label={props["aria-label"]}>{children}</PageSection>;

export const CreateInstancePage: React.FC<{ serviceEntity: ServiceModel }> = ({
  serviceEntity,
}) => {
  const shouldUseAuth =
    process.env.SHOULD_USE_AUTH === "true" || (globalThis && globalThis.auth);
  let keycloak;
  if (shouldUseAuth) {
    // The value will be always true or always false during one session
    [keycloak] = useKeycloak();
  }
  const [errorMessage, setErrorMessage] = useState("");
  const location = useLocation();
  const pathParts = location.pathname.split("/");
  pathParts.pop();
  const inventoryPath = pathParts.join("/").concat(location.search);
  const history = useHistory();
  const handleRedirect = useCallback(() => history.push(`${inventoryPath}`), [
    history,
  ]);

  return (
    <>
      {errorMessage && (
        <AlertGroup isToast>
          <Alert
            variant={"danger"}
            title={errorMessage}
            actionClose={() => setErrorMessage("")}
          />
        </AlertGroup>
      )}
      <CreateFormCard
        serviceEntity={serviceEntity}
        handleRedirect={handleRedirect}
        keycloak={keycloak}
      />
    </>
  );
};
