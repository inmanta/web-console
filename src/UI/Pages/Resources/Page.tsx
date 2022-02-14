import React, { useContext } from "react";
import { Resource } from "@/Core";
import {
  useUrlStateWithFilter,
  useUrlStateWithPageSize,
  useUrlStateWithSort,
} from "@/Data";
import {
  EmptyView,
  PageContainer,
  PaginationWidget,
  RemoteDataView,
} from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { ResourceTableControls } from "./Components";
import { ResourcesTableProvider } from "./ResourcesTableProvider";
import { Summary } from "./Summary";

export const Wrapper: React.FC = ({ children }) => (
  <PageContainer title={words("inventory.tabs.resources")}>
    {children}
  </PageContainer>
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
      {tableControls}
      <RemoteDataView
        data={data}
        label="ResourcesView"
        retry={retry}
        SuccessView={(resources) =>
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
          )
        }
      />
    </Wrapper>
  );
};
