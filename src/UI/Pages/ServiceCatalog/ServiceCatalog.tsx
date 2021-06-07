import React, { useContext } from "react";
import {
  EmptyView,
  ErrorView,
  LoadingView,
  PageSectionWithHorizontalScroll,
} from "@/UI/Components";
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
        <PageSectionWithHorizontalScroll aria-label="ServiceCatalog-Loading">
          <LoadingView delay={500} />
        </PageSectionWithHorizontalScroll>
      ),
      failed: (error) => (
        <PageSectionWithHorizontalScroll aria-label="ServiceCatalog-Failed">
          <ErrorView message={error} retry={retry} />
        </PageSectionWithHorizontalScroll>
      ),
      success: (services) =>
        services.length <= 0 ? (
          <PageSectionWithHorizontalScroll aria-label="ServiceCatalog-Empty">
            <EmptyView message={words("catalog.empty.message")} />
          </PageSectionWithHorizontalScroll>
        ) : (
          <PageSectionWithHorizontalScroll aria-label="ServiceCatalog-Success">
            <CatalogDataList services={services} />
          </PageSectionWithHorizontalScroll>
        ),
    },
    data
  );
};
