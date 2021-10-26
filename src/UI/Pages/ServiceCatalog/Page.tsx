import React, { useContext } from "react";
import {
  EmptyView,
  ErrorView,
  LoadingView,
  PageSectionWithTitle,
} from "@/UI/Components";
import { words } from "@/UI/words";
import { DependencyContext } from "@/UI/Dependency";
import { RemoteData } from "@/Core";
import { CatalogDataList } from "./CatalogDataList";

const Wrapper: React.FC = ({ children, ...props }) => (
  <PageSectionWithTitle {...props} title={words("catalog.title")}>
    {children}
  </PageSectionWithTitle>
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
          <LoadingView delay={500} />
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
