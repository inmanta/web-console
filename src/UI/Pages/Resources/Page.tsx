import { ResourceParams, RemoteData } from "@/Core";
import { DependencyContext } from "@/UI/Dependency";
import {
  EmptyView,
  ErrorView,
  LoadingView,
  PageSectionWithTitle,
  PaginationWidget,
} from "@/UI/Components";
import { words } from "@/UI/words";
import React, { useContext } from "react";
import { ResourcesTableProvider } from "./ResourcesTableProvider";
import { ResourceTableControls } from "./TableControls";
import { ResourceFilterContext } from "./ResourceFilterContext";
import {
  useUrlStateWithFilter,
  useUrlStateWithPageSize,
  useUrlStateWithSort,
} from "@/Data";

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
  const [filter, setFilter] = useUrlStateWithFilter<ResourceParams.Filter>({
    route: "Resources",
  });
  const [sort, setSort] = useUrlStateWithSort({
    default: { name: "resource_type", order: "asc" },
    route: "Resources",
  });

  const [data, retry] = queryResolver.useContinuous<"Resources">({
    kind: "Resources",
    sort,
    filter,
    pageSize,
  });

  const tableControls = (
    <ResourceTableControls
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
