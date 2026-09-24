import React, { useCallback, useContext, useMemo, useState } from "react";
import { useQuery } from "@apollo/client/react";
import {
  Flex,
  FlexItem,
  Content,
  PageSection,
  Stack,
  StackItem,
  ToolbarItem,
  Label,
  Skeleton,
  Tooltip,
} from "@patternfly/react-core";
import { CubesIcon } from "@patternfly/react-icons";
import { Resource } from "@/Core";
import { usePaginatedTableWithMultiSort } from "@/Data";
import { buildHandlers, mapToResourceActionFilter, parseCurrentPage } from "@/Data/Queries";
import {
  EmptyView,
  FilterDrawer,
  PaginationWidget,
  ErrorView,
  CompoundResourceStatus,
  CompoundResourceStatusSkeleton,
  Spinner,
  countActiveFilters,
  ResourceActions,
} from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { ResourceTableControls, ConnectedFilterWidget } from "./Components";
import { PartialErrorDemoButton } from "./PartialErrorDemoButton";
import { ResourceHealthDemoButton } from "./ResourceHealthDemoButton";
import { ResourcesTable } from "./ResourcesTable";
import { GET_RESOURCES, toResourcesVariables } from "./resourcesQuery";

/**
 * The resources page. It renders right away with placeholders, and the deferred page of resources and
 * the summary each fill in as they resolve.
 */
export const Page: React.FC = () => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(false);
  const { currentPage, setCurrentPage, pageSize, setPageSize, sort, setSort, filter, setFilter } =
    usePaginatedTableWithMultiSort<Resource.FilterWithDefaultHandling, Resource.SortKey>({
      route: "Resources",
      defaultSort: [{ name: "resource_type", order: "asc" }],
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

  const { data, previousData, error, refetch } = useQuery(GET_RESOURCES, {
    variables: toResourcesVariables({
      env,
      pageSize,
      filter: filterWithDefaults,
      sort,
      currentPage,
    }),
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
    // A poll refetch keeps showing the current result, including a table error, until the new one arrives.
    notifyOnNetworkStatusChange: false,
    refetchOn: { poll: true },
  });

  const updateFilter = (updater: (filter: Resource.Filter) => Resource.Filter): void =>
    setFilter(updater(filterWithDefaults));

  const onDeployingClick = (): void => {
    updateFilter((filter) => {
      const current = filter.status ?? [];

      if (current.includes("isDeploying")) {
        return { ...filter, status: current.filter((status) => status !== "isDeploying") };
      }

      return { ...filter, status: [...current, "isDeploying"] };
    });
  };

  // Until the first payload for a new page or filter arrives, keep the summary of the previous one on screen.
  const rawResourceSummary = data?.resourceSummary ?? previousData?.resourceSummary;
  const resourceSummary = rawResourceSummary && Resource.toResourceSummary(rawResourceSummary);
  const connection = data?.resources;
  const pageSizeNum = Number(pageSize.value);
  const { beforeCount } = parseCurrentPage(currentPage);

  const page = useMemo(() => {
    if (!connection) {
      return undefined;
    }

    const total = connection.totalCount ?? 0;

    return {
      resources: connection.edges.map((edge) => edge.node),
      metadata: {
        total,
        before: beforeCount,
        after: Math.max(0, total - beforeCount - connection.edges.length),
        page_size: pageSizeNum,
      },
      handlers: buildHandlers(connection.pageInfo, beforeCount, pageSizeNum),
    };
  }, [connection, beforeCount, pageSizeNum]);

  // Pagination data for the page that is loading: its range is known from the URL, its total is not.
  const loadingPage = {
    handlers: {},
    metadata: {
      total: beforeCount + pageSizeNum,
      before: beforeCount,
      after: 0,
      page_size: pageSizeNum,
    },
  };

  if (error && !page && !resourceSummary) {
    return (
      <ErrorView
        message={error.message}
        ariaLabel="ResourcesPage-Error"
        retry={() => void refetch()}
      />
    );
  }

  const deployingCount = resourceSummary?.isDeploying.true ?? 0;
  // Only the deferred resources part failed: the summary stays and the table shows the error.
  const tableError = error && !connection ? error : undefined;

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
              {words("resources")}
            </Content>
            <Tooltip
              content={words("resources.deploying.popover")(deployingCount)}
              aria-label={words("resources.deploying.popover")(deployingCount)}
              isVisible={deployingCount > 0 ? undefined : false}
            >
              <Label
                icon={<CubesIcon />}
                variant="outline"
                color="blue"
                data-testid="deploying-label"
                onClick={deployingCount > 0 ? onDeployingClick : undefined}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}>
                  {deployingCount > 0 && (
                    <>
                      {deployingCount}
                      <Spinner aria-label={words("resources.deploying.spinner")} />
                      <span>/</span>
                    </>
                  )}
                  {resourceSummary ? (
                    resourceSummary.totalCount
                  ) : (
                    <Skeleton width="2ch" screenreaderText={words("loading")} />
                  )}
                </span>
              </Label>
            </Tooltip>
          </Flex>
          <Flex>
            <ToolbarItem>
              <PartialErrorDemoButton currentPage={currentPage} setCurrentPage={setCurrentPage} />
            </ToolbarItem>
            <ToolbarItem>
              <ResourceHealthDemoButton resourceId={page?.resources[0]?.resourceId} />
            </ToolbarItem>
            <ToolbarItem>
              <ResourceActions
                scopes={[
                  {
                    id: "filtered",
                    title: words("resources.resourceActions.confirm.filtered.title"),
                    filter: mapToResourceActionFilter(filterWithDefaults),
                    count: page ? Number(page.metadata.total) : undefined,
                  },
                  {
                    id: "environment",
                    title: words("resources.resourceActions.confirm.environment.title"),
                    // The whole environment minus orphans. resourceSummary.totalCount already
                    // excludes orphans, so the count matches this filter exactly.
                    filter: { isOrphan: false },
                    detail: words("resources.resourceActions.confirm.environment.note"),
                    count: resourceSummary?.totalCount,
                  },
                ]}
              />
            </ToolbarItem>
          </Flex>
        </Flex>

        <ResourceTableControls
          summaryWidget={
            resourceSummary ? (
              <CompoundResourceStatus
                updateFilter={updateFilter}
                resourceSummary={resourceSummary}
              />
            ) : (
              <CompoundResourceStatusSkeleton />
            )
          }
          paginationWidget={
            <PaginationWidget
              data={page ?? loadingPage}
              isLoading={!page}
              pageSize={pageSize}
              setPageSize={setPageSize}
              setCurrentPage={setCurrentPage}
            />
          }
          onToggleFilters={() => setIsDrawerExpanded((prev) => !prev)}
          isDrawerExpanded={isDrawerExpanded}
          activeFilterCount={activeFilterCount}
          noResourcesFound={page?.resources.length === 0}
        />
      </PageSection>
      <PageSection
        hasBodyWrapper={false}
        isFilled
        padding={{ default: "padding" }}
        style={{ display: "flex", flexDirection: "column", flex: "1 1 auto", minHeight: 0 }}
      >
        <FilterDrawer
          isExpanded={isDrawerExpanded}
          panelContent={<ConnectedFilterWidget onClose={onCloseFilterWidget} />}
        >
          {tableError ? (
            <ErrorView
              title={words("resources.tableError.title")}
              message={tableError.message}
              ariaLabel="ResourcesPage-TableError"
              retry={() => void refetch()}
            />
          ) : page?.resources.length === 0 ? (
            <EmptyView
              message={words("resources.empty.filterMessage")}
              aria-label="ResourcesPage-Empty"
            />
          ) : (
            <Stack hasGutter style={{ flex: "1 1 auto", minHeight: 0, height: "100%" }}>
              <StackItem isFilled style={{ minHeight: 0, height: "100%", overflow: "auto" }}>
                <ResourcesTable
                  aria-label={page ? "ResourcesPage-Success" : "ResourcesPage-Loading"}
                  aria-busy={!page}
                  resources={page?.resources}
                  loadingRowCount={pageSizeNum}
                  sort={sort}
                  setSort={setSort}
                />
              </StackItem>
              <StackItem>
                <Flex justifyContent={{ default: "justifyContentFlexEnd" }}>
                  <FlexItem>
                    <PaginationWidget
                      data={page ?? loadingPage}
                      isLoading={!page}
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
        </FilterDrawer>
      </PageSection>
    </>
  );
};
