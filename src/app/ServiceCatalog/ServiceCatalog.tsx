import React, { useContext } from "react";
import { PageSection } from "@patternfly/react-core";
import { CatalogDataList } from "./CatalogDataList";
import { useStoreState } from "@/UI/Store";
import { useKeycloak } from "react-keycloak";
import { EmptyView, ErrorView, LoadingView } from "@/UI/Components";
import { words } from "@/UI/words";
import { ServicesContext } from "@/UI";
import { Query, RemoteData, ServiceModel } from "@/Core";

export const ServiceCatalogWithProvider: React.FC = () => {
  const environmentId = useStoreState(
    (store) => store.environments.getSelectedEnvironment.id
  );

  return environmentId ? (
    <ServiceCatalog environmentId={environmentId} />
  ) : (
    <PageSection
      className={"horizontally-scrollable"}
      aria-label="ServiceCatalog-Failed"
    >
      <ErrorView error={words("error.environment.missing")} delay={1000} />
    </PageSection>
  );
};

interface Props {
  environmentId: string;
}

export const ServiceCatalog: React.FC<Props> = ({ environmentId }) => {
  const { dataProvider } = useContext(ServicesContext);
  const query: Query.SubQuery<"Services"> = {
    kind: "Services",
    qualifier: { id: environmentId },
  };
  const [data, retry] = dataProvider.useContinuous<"Services">(query);

  const shouldUseAuth =
    process.env.SHOULD_USE_AUTH === "true" || (globalThis && globalThis.auth);

  let keycloak;
  if (shouldUseAuth) {
    // The value will be always true or always false during one session
    [keycloak] = useKeycloak();
  }

  return RemoteData.fold<string, ServiceModel[], JSX.Element | null>({
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
        <ErrorView error={error} retry={retry} />
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
            environmentId={environmentId}
            serviceCatalogUrl={"/lsm/v1/service_catalog"}
            keycloak={keycloak}
            dispatch={retry}
          />
        </PageSection>
      ),
  })(data);
};
