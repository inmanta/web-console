import React, { useContext } from "react";
import { PageSection } from "@patternfly/react-core";
import { EmptyView, ErrorView, LoadingView } from "@/UI/Components";
import { words } from "@/UI/words";
import { DependencyContext } from "@/UI/Dependency";
import { RemoteData } from "@/Core";
import { CatalogDataList } from "./CatalogDataList";

export const ServiceCatalog: React.FC = () => {
  const { queryResolver } = useContext(DependencyContext);
  const [data, retry] = queryResolver.useContinuous<"Services">({
    kind: "Services",
  });

  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => (
        <PageSection aria-label="ServiceCatalog-Loading">
          <LoadingView delay={500} />
        </PageSection>
      ),
      failed: (error) => (
        <PageSection aria-label="ServiceCatalog-Failed">
          <ErrorView message={error} retry={retry} />
        </PageSection>
      ),
      success: (services) =>
        services.length <= 0 ? (
          <PageSection aria-label="ServiceCatalog-Empty">
            <EmptyView message={words("catalog.empty.message")} />
          </PageSection>
        ) : (
          <PageSection aria-label="ServiceCatalog-Success">
            <CatalogDataList services={services} />
          </PageSection>
        ),
    },
    data
  );
};
