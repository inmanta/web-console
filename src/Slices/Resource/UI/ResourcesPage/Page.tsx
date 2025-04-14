import React, { useEffect } from "react";
import { Flex, FlexItem } from "@patternfly/react-core";
import { Resource } from "@/Core";
import { useUrlStateWithFilter, useUrlStateWithPageSize, useUrlStateWithSort } from "@/Data";
import { useUrlStateWithCurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import { useGetResources } from "@/Data/Managers/V2/Resource/GetResources";
import {
  EmptyView,
  PageContainer,
  PaginationWidget,
  ErrorView,
  LoadingView,
} from "@/UI/Components";
import { words } from "@/UI/words";
import { ResourceTableControls } from "./Components";
import { ResourcesTableProvider } from "./ResourcesTableProvider";
import { Summary } from "./Summary";

const Wrapper: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => (
  <PageContainer pageTitle={words("inventory.tabs.resources")}>{children}</PageContainer>
);

export const Page: React.FC = () => {
  const [currentPage, setCurrentPage] = useUrlStateWithCurrentPage({
    route: "Resources",
  });
  const [pageSize, setPageSize] = useUrlStateWithPageSize({
    route: "Resources",
  });
  const [filter, setFilter] = useUrlStateWithFilter<Resource.FilterWithDefaultHandling>({
    route: "Resources",
    keys: { disregardDefault: "Boolean" },
  });
  const [sort, setSort] = useUrlStateWithSort<Resource.SortKey>({
    default: { name: "resource_type", order: "asc" },
    route: "Resources",
  });

  const filterWithDefaults =
    !filter.disregardDefault && !filter.status ? { ...filter, status: ["!orphaned"] } : filter;

  const { data, isSuccess, isError, refetch, error } = useGetResources({
    pageSize,
    filter: filterWithDefaults,
    sort,
    currentPage,
  }).useContinuous();

  //when sorting is triggered, reset the current page
  useEffect(() => {
    setCurrentPage({ kind: "CurrentPage", value: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort.order]);

  const updateFilter = (updater: (filter: Resource.Filter) => Resource.Filter): void =>
    setFilter(updater(filterWithDefaults));

  if (isError) {
    return <ErrorView message={error.message} ariaLabel="ResourcesPage-Error" retry={refetch} />;
  }

  if (isSuccess) {
    return (
      <Wrapper>
        <ResourceTableControls
          summaryWidget={<Summary data={data} updateFilter={updateFilter} />}
          paginationWidget={
            <PaginationWidget
              data={data}
              pageSize={pageSize}
              setPageSize={setPageSize}
              setCurrentPage={setCurrentPage}
            />
          }
          filter={filterWithDefaults}
          setFilter={setFilter}
        />
        {data.data.length <= 0 ? (
          <EmptyView message={words("resources.empty.message")} aria-label="ResourcesPage-Empty" />
        ) : (
          <>
            <ResourcesTableProvider
              sort={sort}
              setSort={setSort}
              resources={data.data}
              aria-label="ResourcesPage-Success"
            />
            <Flex justifyContent={{ default: "justifyContentFlexEnd" }}>
              <FlexItem>
                <PaginationWidget
                  data={data}
                  pageSize={pageSize}
                  setPageSize={setPageSize}
                  setCurrentPage={setCurrentPage}
                  variant="bottom"
                />
              </FlexItem>
            </Flex>
          </>
        )}
      </Wrapper>
    );
  }

  return <LoadingView ariaLabel="ResourcesPage-Loading" />;
};
