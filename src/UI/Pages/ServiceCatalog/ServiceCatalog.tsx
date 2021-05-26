import React, { useContext } from "react";
import { PageSection } from "@patternfly/react-core";
import { useKeycloak } from "react-keycloak";
import {
  EmptyView,
  EnvironmentProvider,
  ErrorView,
  LoadingView,
} from "@/UI/Components";
import { words } from "@/UI/words";
import { DependencyContext } from "@/UI/Dependency";
import { Query, RemoteData } from "@/Core";
import { CatalogDrawer } from "./CatalogDrawer";

export const ServiceCatalogWithProvider: React.FC = () => {
  return (
    <EnvironmentProvider
      Wrapper={({ children }) => (
        <PageSection aria-label="ServiceCatalog-Failed">{children}</PageSection>
      )}
      Dependant={({ environment }) => (
        <ServiceCatalog environment={environment} />
      )}
    />
  );
};

export const ServiceCatalog: React.FC<{ environment: string }> = ({
  environment,
}) => {
  const { queryResolver } = useContext(DependencyContext);
  const query: Query.SubQuery<"Services"> = { kind: "Services" };
  const [data, retry] = queryResolver.useContinuous<"Services">(query);

  const shouldUseAuth =
    process.env.SHOULD_USE_AUTH === "true" || (globalThis && globalThis.auth);

  let keycloak;
  if (shouldUseAuth) {
    // The value will be always true or always false during one session
    [keycloak] = useKeycloak();
  }

  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => (
        <PageSection
          className="horizontally-scrollable"
          aria-label="ServiceCatalog-Loading"
        >
          <LoadingView delay={500} />
        </PageSection>
      ),
      failed: (error) => (
        <PageSection
          className="horizontally-scrollable"
          aria-label="ServiceCatalog-Failed"
        >
          <ErrorView message={error} retry={retry} />
        </PageSection>
      ),
      success: (services) =>
        services.length <= 0 ? (
          <PageSection
            className="horizontally-scrollable"
            aria-label="ServiceCatalog-Empty"
          >
            <EmptyView message={words("catalog.empty.message")} />
          </PageSection>
        ) : (
          <PageSection
            className="horizontally-scrollable"
            aria-label="ServiceCatalog-Success"
          >
            <CatalogDrawer
              services={services}
              environmentId={environment}
              serviceCatalogUrl={"/lsm/v1/service_catalog"}
              keycloak={keycloak}
              dispatch={retry}
            />
          </PageSection>
        ),
    },
    data
  );
};
