import {
  LatestReleasedResourceParams,
  RemoteData,
  SortDirection,
} from "@/Core";
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
  const [filter, setFilter] = useState<LatestReleasedResourceParams.Filter>({});
  const [sortColumn, setSortColumn] = useState<string | undefined>(
    "resource_type"
  );
  const [order, setOrder] = useState<SortDirection | undefined>("asc");
  const sort =
    sortColumn && order ? { name: sortColumn, order: order } : undefined;
  const [data, retry] = queryResolver.useContinuous<"LatestReleasedResources">({
    kind: "LatestReleasedResources",
    sort,
    filter,
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
    <ResourceTableControls
      paginationWidget={paginationWidget}
      filter={filter}
      setFilter={setFilter}
    />
  );

  return (
    <Wrapper>
      {tableControls}
      {RemoteData.fold(
        {
          notAsked: () => null,
          loading: () => <LoadingView aria-label="ResourcesView-Loading" />,
          failed: (error) => (
            <ErrorView
              message={error}
              retry={retry}
              aria-label="ResourcesView-Failed"
            />
          ),
          success: (resources) =>
            resources.data.length <= 0 ? (
              <EmptyView
                message={words("resources.empty.message")}
                aria-label="ResourcesView-Empty"
              />
            ) : (
              <ResourcesTableProvider
                order={order}
                setOrder={setOrder}
                sortColumn={sortColumn}
                setSortColumn={setSortColumn}
                resources={resources.data}
                aria-label="ResourcesView-Success"
              />
            ),
        },
        data
      )}
    </Wrapper>
  );
};
