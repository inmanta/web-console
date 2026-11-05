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
  const [ownedServicesExpansion, setOwnedServicesExpansion] = useState({
    isExpandedByDefault: false,
    resetCount: 0,
  });
  const [isToolbarStuck, setIsToolbarStuck] = useState(false);
  const hasOwnedServices = getAllCatalogServices(sections).some(
    (service) => service.ownedServices.length > 0
  );

  /**
   * Remounts the catalog so every row starts again with its owned services expanded or collapsed.
   */
  const resetOwnedServicesExpansion = (isExpandedByDefault: boolean): void => {
    setOwnedServicesExpansion(({ resetCount }) => ({
      isExpandedByDefault,
      resetCount: resetCount + 1,
    }));
  };

  const toolbar = hasOwnedServices ? (
    <Toolbar isStickyBase isStickyStuck={isToolbarStuck}>
      <ToolbarContent>
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
            key={ownedServicesExpansion.resetCount}
            sections={sections}
            isExpandedByDefault={ownedServicesExpansion.isExpandedByDefault}
          />
        </Flex>
      );
  }

  return (
    <PageContainer
      pageTitle={words("catalog.title")}
      actions={<CatalogActions />}
      onScroll={(event) => setIsToolbarStuck(event.currentTarget.scrollTop > 0)}
      // The sticky toolbar brings its own top padding; the section's would leave a strip above it where scrolled rows show.
      style={isSuccess && toolbar ? { paddingBlockStart: 0 } : undefined}
    >
      {component}
    </PageContainer>
  );
};
