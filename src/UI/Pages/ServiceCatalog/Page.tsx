import React, { useContext } from "react";
import { RemoteData } from "@/Core";
import {
  EmptyView,
  ErrorView,
  LoadingView,
  PageContainer,
} from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { CatalogDataList } from "./CatalogDataList";

const Wrapper: React.FC = ({ children, ...props }) => (
  <PageContainer {...props} title={words("catalog.title")}>
    {children}
  </PageContainer>
);

export const Page: React.FC = () => {
  const { queryResolver } = useContext(DependencyContext);
  const [data, retry] = queryResolver.useContinuous<"GetServices">({
    kind: "GetServices",
  });

  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => (
        <Wrapper aria-label="ServiceCatalog-Loading">
          <LoadingView />
        </Wrapper>
      ),
      failed: (error) => (
        <Wrapper aria-label="ServiceCatalog-Failed">
          <ErrorView message={error} retry={retry} />
        </Wrapper>
      ),
      success: (services) =>
        services.length <= 0 ? (
          <Wrapper aria-label="ServiceCatalog-Empty">
            <EmptyView message={words("catalog.empty.message")} />
          </Wrapper>
        ) : (
          <Wrapper aria-label="ServiceCatalog-Success">
            <CatalogDataList services={services} />
          </Wrapper>
        ),
    },
    data
  );
};
