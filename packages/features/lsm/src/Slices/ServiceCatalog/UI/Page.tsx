import React, { useMemo, useState } from "react";
import { Button, Flex, Toolbar, ToolbarContent, ToolbarItem } from "@patternfly/react-core";
import { words } from "@inmanta/web-console-core";
import { useGetServiceModels } from "@inmanta/web-console-core/Queries/Slices/Service";
import { CatalogActions } from "@inmanta/web-console-feature-lsm/Components/CatalogActions";
import { EmptyView } from "@inmanta/web-console-ui/Components/EmptyView";
import { ErrorView } from "@inmanta/web-console-ui/Components/ErrorView";
import { LoadingView } from "@inmanta/web-console-ui/Components/LoadingView";
import { PageContainer } from "@inmanta/web-console-ui/Components/PageContainer";
import { CatalogSections } from "./CatalogSections";
import { createCatalogSections, getAllCatalogServices } from "./helpers";

export const Page: React.FC = () => {
  const { data, isError, error, isSuccess, refetch } = useGetServiceModels().useContinuous();
  const sections = useMemo(() => createCatalogSections(data ?? []), [data]);
  const [expandedServiceNames, setExpandedServiceNames] = useState<Set<string>>(new Set());
  const ownerServiceNames = getAllCatalogServices(sections)
    .filter((service) => service.ownedServices.length > 0)
    .map((service) => service.serviceModel.name);

  /**
   * Expands the owned services of a service when they are collapsed, and collapses them otherwise.
   */
  const toggleOwnedServices = (serviceName: string): void => {
    setExpandedServiceNames((currentExpandedServiceNames) => {
      const updatedExpandedServiceNames = new Set(currentExpandedServiceNames);

      if (updatedExpandedServiceNames.has(serviceName)) {
        updatedExpandedServiceNames.delete(serviceName);
      } else {
        updatedExpandedServiceNames.add(serviceName);
      }

      return updatedExpandedServiceNames;
    });
  };

  const toolbar =
    ownerServiceNames.length > 0 ? (
      <Toolbar isSticky>
        <ToolbarContent>
          <ToolbarItem>
            <Button
              variant="link"
              isInline
              onClick={() => setExpandedServiceNames(new Set(ownerServiceNames))}
            >
              {words("expandAll")}
            </Button>
          </ToolbarItem>
          <ToolbarItem>
            <Button variant="link" isInline onClick={() => setExpandedServiceNames(new Set())}>
              {words("collapseAll")}
            </Button>
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
    ) : undefined;

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
          <CatalogSections
            sections={sections}
            expandedServiceNames={expandedServiceNames}
            onToggleOwnedServices={toggleOwnedServices}
          />
        </Flex>
      );
  }

  return (
    <PageContainer
      pageTitle={words("catalog.title")}
      actions={<CatalogActions />}
      // The sticky toolbar brings its own top padding; the section's would leave a strip above it where scrolled rows show.
      style={isSuccess && toolbar ? { paddingBlockStart: 0 } : undefined}
    >
      {component}
    </PageContainer>
  );
};
