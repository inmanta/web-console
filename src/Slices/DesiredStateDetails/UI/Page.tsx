import React, { useCallback, useMemo, useState } from "react";
import {
  Content,
  Drawer,
  DrawerContent,
  DrawerContentBody,
  PageSection,
} from "@patternfly/react-core";
import { Resource } from "@/Core";
import { usePaginatedTable } from "@/Data";
import { useGetVersionResources } from "@/Data/Queries";
import { EmptyView, ErrorView, LoadingView, PaginationWidget, countActiveFilters } from "@/UI/Components";
import { useRouteParams } from "@/UI/Routing";
import { words } from "@/UI/words";
import { Controls, DesiredStateDetailsFilterWidget } from "./Controls";
import { VersionResourceTable } from "./VersionResourceTable";
import { VersionResourceTablePresenter } from "./VersionResourceTablePresenter";

export const Provider: React.FC = () => {
  const { version } = useRouteParams<"DesiredStateDetails">();

  return <Page version={version} />;
};

export const Page: React.FC<{ version: string }> = ({ version }) => {
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(false);
  const { currentPage, setCurrentPage, pageSize, setPageSize, filter, sort, setSort } =
    usePaginatedTable<Resource.FilterFromVersion, Resource.SortKeyFromVersion>({
      route: "DesiredStateDetails",
      defaultSort: { name: "resource_type", order: "asc" },
    });

  const activeFilterCount = useMemo(() => countActiveFilters(filter), [filter]);

  const onCloseFilterWidget = useCallback(() => setIsDrawerExpanded(false), []);

  const { data, isSuccess, isError, error, refetch } = useGetVersionResources({
    version,
    pageSize,
    filter,
    sort,
    currentPage,
  }).useContinuous();

  const presenter = new VersionResourceTablePresenter();

  if (isError) {
    return (
      <ErrorView ariaLabel="VersionResourcesTable-Error" retry={refetch} message={error.message} />
    );
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
          <Content component="h1">{words("desiredState.details.title")}</Content>
          <Controls
            paginationWidget={
              <PaginationWidget
                data={data}
                pageSize={pageSize}
                setPageSize={setPageSize}
                setCurrentPage={setCurrentPage}
              />
            }
            onToggleFilters={() => setIsDrawerExpanded((prev) => !prev)}
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
            <DrawerContent panelContent={<DesiredStateDetailsFilterWidget onClose={onCloseFilterWidget} />}>
              <DrawerContentBody
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flex: "1 1 auto",
                  minHeight: 0,
                }}
              >
                {data.data.length <= 0 ? (
                  <EmptyView
                    message={words("resources.empty.message")}
                    aria-label="VersionResourcesTable-Empty"
                  />
                ) : (
                  <VersionResourceTable
                    aria-label="VersionResourcesTable-Success"
                    version={version}
                    rows={presenter.createRows(data.data)}
                    tablePresenter={new VersionResourceTablePresenter()}
                    sort={sort}
                    setSort={setSort}
                  />
                )}
              </DrawerContentBody>
            </DrawerContent>
          </Drawer>
        </PageSection>
      </>
    );
  }

  return <LoadingView ariaLabel="VersionResourcesTable-Loading" />;
};
