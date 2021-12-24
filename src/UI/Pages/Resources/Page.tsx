import React, { useContext } from "react";
import { Resource, RemoteData } from "@/Core";
import {
  useUrlStateWithFilter,
  useUrlStateWithPageSize,
  useUrlStateWithSort,
} from "@/Data";
import {
  EmptyView,
  ErrorView,
  LoadingView,
  PageSectionWithTitle,
  PaginationWidget,
} from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { ResourceFilterContext } from "./ResourceFilterContext";
import { ResourcesTableProvider } from "./ResourcesTableProvider";
import { Summary } from "./Summary";
import { ResourceTableControls } from "./TableControls";

export const Wrapper: React.FC = ({ children }) => (
  <PageSectionWithTitle title={words("inventory.tabs.resources")}>
    {children}
  </PageSectionWithTitle>
);

export const Page: React.FC = () => {
  const { queryResolver } = useContext(DependencyContext);
  const [pageSize, setPageSize] = useUrlStateWithPageSize({
    route: "Resources",
  });
  const [filter, setFilter] = useUrlStateWithFilter<Resource.Filter>({
    route: "Resources",
  });
  const [sort, setSort] = useUrlStateWithSort<Resource.SortKey>({
    default: { name: "resource_type", order: "asc" },
    route: "Resources",
  });

  const [data, retry] = queryResolver.useContinuous<"GetResources">({
    kind: "GetResources",
    sort,
    filter,
    pageSize,
  });

  const updateFilter = (
    updater: (filter: Resource.Filter) => Resource.Filter
  ): void => setFilter(updater(filter));

  const tableControls = (
    <ResourceTableControls
      summaryWidget={<Summary data={data} updateFilter={updateFilter} />}
      paginationWidget={
        <PaginationWidget
          data={data}
          pageSize={pageSize}
          setPageSize={setPageSize}
        />
      }
      filter={filter}
      setFilter={setFilter}
    />
  );

  return (
    <Wrapper>
      <ResourceFilterContext.Provider value={{ setFilter }}>
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
                  sort={sort}
                  setSort={setSort}
                  resources={resources.data}
                  aria-label="ResourcesView-Success"
                />
              ),
          },
          data
        )}
      </ResourceFilterContext.Provider>
    </Wrapper>
  );
};
