import { RemoteData } from "@/Core";
import { DependencyContext } from "@/UI/Dependency";
import {
  EmptyView,
  ErrorView,
  LoadingView,
  PageSectionWithTitle,
  PaginationWidget,
} from "@/UI/Components";
import { words } from "@/UI/words";
import React, { useContext, useState } from "react";
import { ResourcesTableProvider } from "./ResourcesTableProvider";
import { ResourceTableControls } from "./ResourceTableControls";

export const Wrapper: React.FC = ({ children }) => (
  <PageSectionWithTitle title={words("inventory.tabs.resources")}>
    {children}
  </PageSectionWithTitle>
);

export const ResourcesView: React.FC = () => {
  const { queryResolver } = useContext(DependencyContext);
  const [pageSize, setPageSize] = useState(20);
  const [data, retry] = queryResolver.useContinuous<"LatestReleasedResources">({
    kind: "LatestReleasedResources",
    pageSize,
  });

  const paginationWidget = RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => null,
      failed: () => null,
      success: ({ handlers, metadata }) => (
        <PaginationWidget
          handlers={handlers}
          metadata={metadata}
          pageSize={pageSize}
          setPageSize={setPageSize}
        />
      ),
    },
    data
  );
  const tableControls = (
    <ResourceTableControls paginationWidget={paginationWidget} />
  );

  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => (
        <Wrapper>
          <LoadingView delay={500} aria-label="ResourcesView-Loading" />
        </Wrapper>
      ),
      failed: (error) => (
        <Wrapper>
          <ErrorView
            message={error}
            retry={retry}
            aria-label="ResourcesView-Failed"
          />
        </Wrapper>
      ),
      success: (resources) =>
        resources.data.length <= 0 ? (
          <Wrapper>
            <EmptyView
              message={words("resources.empty.message")}
              aria-label="ResourcesView-Empty"
            />
          </Wrapper>
        ) : (
          <Wrapper>
            {tableControls}
            <ResourcesTableProvider
              resources={resources.data}
              aria-label="ResourcesView-Success"
            />
          </Wrapper>
        ),
    },
    data
  );
};
