import React, { useContext } from "react";
import { PageSection } from "@patternfly/react-core";
import { CatalogDataList } from "./CatalogDataList";
import { useStoreState } from "@/UI/Store";
import { useKeycloak } from "react-keycloak";
import { EmptyView, ErrorView, LoadingView } from "@/UI/Components";
import { words } from "@/UI/words";
import { ServicesContext } from "@/UI";
import { Query, RemoteData } from "@/Core";

export const ServiceCatalogWithProvider: React.FC = () => {
  const environment = useStoreState(
    (store) => store.environments.getSelectedEnvironment.id
  );

  return environment ? (
    <ServiceCatalog environment={environment} />
  ) : (
    <PageSection
      className={"horizontally-scrollable"}
      aria-label="ServiceCatalog-Failed"
    >
      <ErrorView message={words("error.environment.missing")} delay={1000} />
    </PageSection>
  );
};

export const ServiceCatalog: React.FC<{ environment: string }> = ({
  environment,
}) => {
  const { dataProvider } = useContext(ServicesContext);
  const query: Query.SubQuery<"Services"> = {
    kind: "Services",
    qualifier: { environment },
  };
  const [data, retry] = dataProvider.useContinuous<"Services">(query);

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
            <CatalogDataList
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
