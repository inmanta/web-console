import React, { useEffect, useState } from "react";
import {
  Flex,
  FlexItem,
  Drawer,
  DrawerContent,
  DrawerContentBody,
  Content,
  PageSection,
  Stack,
  StackItem,
} from "@patternfly/react-core";
import { Resource } from "@/Core";
import { useUrlStateWithFilter, useUrlStateWithPageSize, useUrlStateWithSort } from "@/Data";
import { useUrlStateWithCurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import { useGetResources } from "@/Data/Queries";
import {
  EmptyView,
  PaginationWidget,
  ErrorView,
  LoadingView,
} from "@/UI/Components";
import { words } from "@/UI/words";
import { ResourceTableControls, FilterWidgetComponent } from "./Components";
import { ResourcesTableProvider } from "./ResourcesTableProvider";
import { Summary } from "./Summary";

export const Page: React.FC = () => {
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
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

  useEffect(() => {
    const { disregardDefault, ...filterValues } = filterWithDefaults;
    const count = Object.values(filterValues).reduce((acc, value) => {
      if (!value) {
        return acc;
      }

      if (Array.isArray(value)) {
        return acc + value.length;
      }

      return acc + 1;
    }, 0);

    setActiveFilterCount(count);
  }, [filterWithDefaults]);

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
      <>
        <PageSection
          hasBodyWrapper={false}
          style={{
            position: "sticky",
            top: 0,
            zIndex: 400,
            backgroundColor: "var(--pf-t--global--background--color--primary--default)",
            paddingBottom: "var(--pf-t--global--spacer--md)",
          }}
        >
          <Content component="h1">{words("inventory.tabs.resources")}</Content>
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
            onToggleFilters={() => setIsDrawerExpanded(!isDrawerExpanded)}
            isDrawerExpanded={isDrawerExpanded}
            activeFilterCount={activeFilterCount}
          />
        </PageSection>
        <PageSection
          hasBodyWrapper={false}
          isFilled
          padding={{ default: "padding" }}
          style={{ display: "flex", flexDirection: "column", flex: "1 1 auto", minHeight: 0 }}
        >
          <Drawer
            isExpanded={isDrawerExpanded}
            isInline
            style={{ display: "flex", flexDirection: "column", flex: "1 1 auto" }}
          >
            <DrawerContent
              panelContent={
                <FilterWidgetComponent
                  onClose={() => setIsDrawerExpanded(false)}
                  filter={filterWithDefaults}
                  setFilter={setFilter}
                />
              }
            >
              <DrawerContentBody
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flex: "1 1 auto",
                  minHeight: 0,
                }}
              >
                {data.data.length <= 0 ? (
                  <EmptyView message={words("resources.empty.message")} aria-label="ResourcesPage-Empty" />
                ) : (
                  <Stack hasGutter style={{ flex: "1 1 auto", minHeight: 0, height: "100%" }}>
                    <StackItem isFilled style={{ minHeight: 0, height: "100%", overflow: "auto" }}>
                      <ResourcesTableProvider
                        sort={sort}
                        setSort={setSort}
                        resources={data.data}
                        aria-label="ResourcesPage-Success"
                      />
                    </StackItem>
                    <StackItem>
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
                    </StackItem>
                  </Stack>
                )}
              </DrawerContentBody>
            </DrawerContent>
          </Drawer>
        </PageSection>
      </>
    );
  }

  return <LoadingView ariaLabel="ResourcesPage-Loading" />;
};
