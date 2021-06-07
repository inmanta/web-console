import React, { useContext } from "react";
import { PageSection } from "@patternfly/react-core";
import { EmptyView, ErrorView, LoadingView } from "@/UI/Components";
import { words } from "@/UI/words";
import { DependencyContext } from "@/UI/Dependency";
import { Query, RemoteData } from "@/Core";
import { CatalogDataList } from "./CatalogDataList";

export const ServiceCatalog: React.FC = () => {
  const { queryResolver } = useContext(DependencyContext);
  const query: Query.SubQuery<"Services"> = { kind: "Services" };
  const [data, retry] = queryResolver.useContinuous<"Services">(query);

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
            <CatalogDataList services={services} />
          </PageSection>
        ),
    },
    data
  );
};
