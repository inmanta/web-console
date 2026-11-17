import React, { useMemo, useState } from "react";
import {
  Button,
  Content,
  ContentVariants,
  Flex,
  SearchInput,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from "@patternfly/react-core";
import { words } from "@inmanta/web-console-core";
import { useUrlStateWithFilter } from "@inmanta/web-console-core/Common";
import { useGetServiceModels } from "@inmanta/web-console-core/Queries/Slices/Service";
import { CatalogActions } from "@inmanta/web-console-feature-lsm/Components/CatalogActions";
import { EmptyView } from "@inmanta/web-console-ui/Components/EmptyView";
import { ErrorView } from "@inmanta/web-console-ui/Components/ErrorView";
import { LoadingView } from "@inmanta/web-console-ui/Components/LoadingView";
import { PageContainer } from "@inmanta/web-console-ui/Components/PageContainer";
import { CatalogSections } from "./CatalogSections";
import { createCatalogSections, filterCatalogSections, getAllCatalogServices } from "./helpers";
import { CatalogFilter, OwnedServicesExpansion } from "./types";

export const Page: React.FC = () => {
  const { data, isError, error, isSuccess, refetch } = useGetServiceModels().useContinuous();
  const [filter, setFilter] = useUrlStateWithFilter<CatalogFilter>({ route: "Catalog" });
  const filterText = filter.text ?? "";
  const sections = useMemo(() => createCatalogSections(data ?? []), [data]);
  const filteredCatalogSections = useMemo(
    () => filterCatalogSections(sections, filterText),
    [sections, filterText]
  );
  const [ownedServicesExpansion, setOwnedServicesExpansion] = useState<OwnedServicesExpansion>({
    resetCount: 0,
  });
  const [isToolbarStuck, setIsToolbarStuck] = useState(false);
  const allServices = getAllCatalogServices(sections);
  const hasOwnedServices = allServices.some((service) => service.ownedServices.length > 0);
  const { matchingServiceCount } = filteredCatalogSections;

  /**
   * Remounts the catalog so every row starts again with its owned services expanded or collapsed.
   */
  const resetOwnedServicesExpansion = (isExpandedByDefault: boolean): void => {
    setOwnedServicesExpansion(({ resetCount }) => ({
      isExpandedByDefault,
      resetCount: resetCount + 1,
    }));
  };

  /**
   * Sets the filter text, or clears the filter for an empty text. The owners of the new matches
   * start expanded again, whatever Expand all or Collapse all did before.
   */
  const updateFilterText = (text: string): void => {
    setFilter(text === "" ? {} : { text });
    setOwnedServicesExpansion(({ resetCount }) => ({ isExpandedByDefault: undefined, resetCount }));
  };

  const toolbar = (
    <Toolbar isStickyBase isStickyStuck={isToolbarStuck}>
      <ToolbarContent alignItems="center">
        <ToolbarItem>
          <SearchInput
            value={filterText}
            placeholder={words("catalog.filter.placeholder")}
            aria-label={words("catalog.filter.placeholder")}
            onChange={(_event, value) => updateFilterText(value)}
            onClear={() => updateFilterText("")}
          />
        </ToolbarItem>
        {hasOwnedServices && (
          <>
            <ToolbarItem>
              <Button variant="link" isInline onClick={() => resetOwnedServicesExpansion(true)}>
                {words("expandAll")}
              </Button>
            </ToolbarItem>
            <ToolbarItem>
              <Button variant="link" isInline onClick={() => resetOwnedServicesExpansion(false)}>
                {words("collapseAll")}
              </Button>
            </ToolbarItem>
          </>
        )}
        <ToolbarItem align={{ default: "alignEnd" }}>
          <Content component={ContentVariants.small}>
            {matchingServiceCount < allServices.length
              ? words("catalog.serviceCount.filtered")(matchingServiceCount, allServices.length)
              : words("catalog.serviceCount")(allServices.length)}
          </Content>
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );

  let component: React.JSX.Element = <LoadingView ariaLabel="ServiceCatalog-Loading" />;

  if (isError) {
    component = (
      <ErrorView message={error.message} retry={refetch} ariaLabel="ServiceCatalog-Failed" />
    );
  }

  if (isSuccess) {
    component =
      data.length <= 0 ? (
        <EmptyView aria-label="ServiceCatalog-Empty" message={words("catalog.empty.message")} />
      ) : (
        <Flex
          direction={{ default: "column" }}
          flexWrap={{ default: "nowrap" }}
          gap={{ default: "gapMd" }}
          aria-label="ServiceCatalog-Success"
        >
          {toolbar}
          {filteredCatalogSections.sections.length > 0 ? (
            <CatalogSections
              key={`${filterText}-${ownedServicesExpansion.resetCount}`}
              sections={filteredCatalogSections.sections}
              isExpandedByDefault={ownedServicesExpansion.isExpandedByDefault}
              ownerNamesOfMatchingServices={filteredCatalogSections.ownerNamesOfMatchingServices}
            />
          ) : (
            <EmptyView
              aria-label="ServiceCatalog-NoMatch"
              message={words("empty.filtered.message")}
              onResetFilters={() => updateFilterText("")}
            />
          )}
        </Flex>
      );
  }

  return (
    <PageContainer
      pageTitle={words("catalog.title")}
      actions={<CatalogActions />}
      onScroll={(event) => setIsToolbarStuck(event.currentTarget.scrollTop > 0)}
      // The sticky toolbar brings its own top padding; the section's would leave a strip above it where scrolled rows show.
      style={isSuccess && data.length > 0 ? { paddingBlockStart: 0 } : undefined}
    >
      {component}
    </PageContainer>
  );
};
