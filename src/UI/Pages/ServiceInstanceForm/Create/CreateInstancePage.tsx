import { FormAttributeResult, RemoteData, ServiceModel } from "@/Core";
import {
  Alert,
  AlertActionCloseButton,
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
import { useHistory, useLocation, useParams } from "react-router-dom";
import { words } from "@/UI/words";
import { DependencyContext } from "@/UI/Dependency";
import { CreateFormCard } from "./CreateFormCard";
import { PageParams } from "@/UI/Routing";

export const CreateInstancePageWithProvider: React.FunctionComponent = () => {
  const { service } = useParams<PageParams<"CreateInstance">>();
  return <ServiceProvider serviceName={service} />;
};

const ServiceProvider: React.FunctionComponent<{
  serviceName: string;
}> = ({ serviceName }) => {
  const { queryResolver } = useContext(DependencyContext);

  const [data, retry] = queryResolver.useContinuous<"Service">({
    kind: "Service",
    name: serviceName,
  });

  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => <LoadingView />,
      failed: (error) => <ErrorView error={error} retry={retry} />,
      success: (service) => (
        <PageWrapper aria-label="AddInstance-Success">
          <CreateInstancePage serviceEntity={service} />
        </PageWrapper>
      ),
    },
    data
  );
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
