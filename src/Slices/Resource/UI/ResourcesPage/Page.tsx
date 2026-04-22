import React, { useCallback, useMemo, useState } from "react";
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
  ToolbarItem,
  Label,
  Spinner,
} from "@patternfly/react-core";
import { CubesIcon } from "@patternfly/react-icons";
import { Resource } from "@/Core";
import { usePaginatedTable } from "@/Data";
import { useGetResources } from "@/Data/Queries";
import {
  EmptyView,
  PaginationWidget,
  ErrorView,
  LoadingView,
  CompoundResourceStatus,
  countActiveFilters,
} from "@/UI/Components";
import { words } from "@/UI/words";
import {
  ResourceTableControls,
  ConnectedFilterWidget,
  DeployButton,
  RepairButton,
} from "./Components";
import { ResourcesTable } from "./ResourcesTable";
import { createRows } from "./ResourcesTablePresenter";

export const Page: React.FC = () => {
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(false);
  const { currentPage, setCurrentPage, pageSize, setPageSize, sort, setSort, filter, setFilter } =
    usePaginatedTable<Resource.FilterWithDefaultHandling, Resource.SortKey>({
      route: "Resources",
      defaultSort: { name: "resource_type", order: "asc" },
      filterKeys: { disregardDefault: "Boolean" },
    });

  const filterWithDefaults = useMemo(() => {
    return !filter.disregardDefault && !filter.status
      ? { ...filter, status: ["!orphaned"] }
      : filter;
  }, [filter]);

  const activeFilterCount = useMemo(() => {
    const { disregardDefault: _disregardDefault, ...filterValues } = filterWithDefaults;

    return countActiveFilters(filterValues);
  }, [filterWithDefaults]);

  const onCloseFilterWidget = useCallback(() => {
    setIsDrawerExpanded(false);
  }, []);

  const { data, isSuccess, isFetching, isError, refetch, error } = useGetResources({
    pageSize,
    filter: filterWithDefaults,
    sort,
    currentPage,
  }).useContinuous();

  const updateFilter = (updater: (filter: Resource.Filter) => Resource.Filter): void =>
    setFilter(updater(filterWithDefaults));

  if (isError) {
    return <ErrorView message={error.message} ariaLabel="ResourcesPage-Error" retry={refetch} />;
  }
  if (!isSuccess) {
    return <LoadingView ariaLabel="ResourcesPage-Loading" />;
  }

  const resources = data.resources;
  const resourceSummary = data.resourceSummary;
  const deployingCount = resourceSummary.isDeploying["true"];
  const rows = createRows(resources);

  return (
    <>
      <PageSection
        hasBodyWrapper={false}
        style={{
          paddingBlockEnd: 0,
        }}
      >
        <Flex
          style={{ width: "100%" }}
          alignItems={{ default: "alignItemsCenter" }}
          justifyContent={{ default: "justifyContentSpaceBetween" }}
        >
          <Flex alignItems={{ default: "alignItemsCenter" }} gap={{ default: "gapSm" }}>
            <Content component="h1" style={{ marginBottom: 0 }}>
              {words("inventory.tabs.resources")}
            </Content>
            <Label
              icon={<CubesIcon />}
              variant="outline"
              color="blue"
              data-testid="deploying-label"
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}>
                {deployingCount > 0 && (
                  <>
                    {deployingCount}
                    <Spinner size="sm" isInline />
                    <span>/</span>
                  </>
                )}
                {resourceSummary.totalCount}
              </span>
            </Label>
          </Flex>
          <Flex>
            <ToolbarItem>
              <DeployButton />
            </ToolbarItem>
            <ToolbarItem>
              <RepairButton />
            </ToolbarItem>
          </Flex>
        </Flex>

        <ResourceTableControls
          summaryWidget={
            <CompoundResourceStatus updateFilter={updateFilter} resourceSummary={resourceSummary} />
          }
          paginationWidget={
            <PaginationWidget
              data={data}
              pageSize={pageSize}
              setPageSize={setPageSize}
              setCurrentPage={setCurrentPage}
              isDisabled={isFetching}
            />
          }
          onToggleFilters={() => setIsDrawerExpanded((prev) => !prev)}
          isDrawerExpanded={isDrawerExpanded}
          activeFilterCount={activeFilterCount}
          noResourcesFound={resources.length === 0}
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
          <DrawerContent panelContent={<ConnectedFilterWidget onClose={onCloseFilterWidget} />}>
            <DrawerContentBody
              style={{
                display: "flex",
                flexDirection: "column",
                flex: "1 1 auto",
                minHeight: 0,
              }}
            >
              {resources.length <= 0 ? (
                <EmptyView
                  message={words("resources.empty.filterMessage")}
                  aria-label="ResourcesPage-Empty"
                />
              ) : (
                <Stack hasGutter style={{ flex: "1 1 auto", minHeight: 0, height: "100%" }}>
                  <StackItem isFilled style={{ minHeight: 0, height: "100%", overflow: "auto" }}>
                    <ResourcesTable
                      aria-label="ResourcesPage-Success"
                      rows={rows}
                      sort={sort}
                      setSort={setSort}
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
                          isDisabled={isFetching}
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
};
