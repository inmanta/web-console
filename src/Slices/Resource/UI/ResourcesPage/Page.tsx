import React, { useContext, useEffect, useState } from "react";
import { Flex, FlexItem } from "@patternfly/react-core";
import { RemoteData, Resource } from "@/Core";
import {
  useUrlStateWithFilter,
  useUrlStateWithPageSize,
  useUrlStateWithSort,
} from "@/Data";
import { useUrlStateWithCurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import {
  EmptyView,
  PageContainer,
  OldPaginationWidget,
  RemoteDataView,
} from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { ResourceTableControls } from "./Components";
import { ResourcesTableProvider } from "./ResourcesTableProvider";
import { Summary } from "./Summary";

const Wrapper: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => (
  <PageContainer pageTitle={words("inventory.tabs.resources")}>
    {children}
  </PageContainer>
);

export const Page: React.FC = () => {
  const { queryResolver } = useContext(DependencyContext);
  const [currentPage, setCurrentPage] = useUrlStateWithCurrentPage({
    route: "Resources",
  });
  const [pageSize, setPageSize] = useUrlStateWithPageSize({
    route: "Resources",
  });
  const [filter, setFilter] =
    useUrlStateWithFilter<Resource.FilterWithDefaultHandling>({
      route: "Resources",
      keys: { disregardDefault: "Boolean" },
    });
  const [sort, setSort] = useUrlStateWithSort<Resource.SortKey>({
    default: { name: "resource_type", order: "asc" },
    route: "Resources",
  });

  const filterWithDefaults =
    !filter.disregardDefault && !filter.status
      ? { ...filter, status: ["!orphaned"] }
      : filter;

  const [data, retry] = queryResolver.useContinuous<"GetResources">({
    kind: "GetResources",
    sort,
    filter: filterWithDefaults,
    pageSize,
    currentPage,
  });

  const [staleData, setStaleData] = useState(data);

  //when sorting is triggered, reset the current page
  useEffect(() => {
    setCurrentPage({ kind: "CurrentPage", value: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort.order]);

  useEffect(() => {
    if (RemoteData.isLoading(data)) return;

    setStaleData(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(data)]);

  const updateFilter = (
    updater: (filter: Resource.Filter) => Resource.Filter,
  ): void => setFilter(updater(filterWithDefaults));

  return (
    <Wrapper>
      <ResourceTableControls
        summaryWidget={<Summary data={staleData} updateFilter={updateFilter} />}
        paginationWidget={
          <OldPaginationWidget
            data={staleData}
            pageSize={pageSize}
            setPageSize={setPageSize}
            setCurrentPage={setCurrentPage}
          />
        }
        filter={filterWithDefaults}
        setFilter={setFilter}
      />
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
            <>
              <ResourcesTableProvider
                sort={sort}
                setSort={setSort}
                resources={resources.data}
                aria-label="ResourcesView-Success"
              />
              <Flex justifyContent={{ default: "justifyContentFlexEnd" }}>
                <FlexItem>
                  <OldPaginationWidget
                    data={staleData}
                    pageSize={pageSize}
                    setPageSize={setPageSize}
                    setCurrentPage={setCurrentPage}
                    variant="bottom"
                  />
                </FlexItem>
              </Flex>
            </>
          )
        }
      />
    </Wrapper>
  );
};
