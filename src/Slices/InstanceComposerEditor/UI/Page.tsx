import React, { useContext } from "react";
import { DependencyContext, useRouteParams, words } from "@/UI";
import { EmptyView, PageContainer } from "@/UI/Components";
import { Canvas } from "@/UI/Components/Diagram/Canvas";
import { InstanceWithRelationsProvider } from "@/UI/Components/InstanceWithRelationsProvider";
import { RelatedInventoriesProvider } from "@/UI/Components/RelatedInventoriesProvider/RelatedInventoriesProvider";
import { ServicesWithMainProvider } from "@/UI/Components/ServicesWithMainProvider/ServicesWithMainProvider";

/**
 * Renders the Page component for the Instance Composer Editor Page.
 * If the composer feature is enabled, it renders the Canvas component wrapped in a ServicesProvider.
 * If the composer feature is disabled, it renders an EmptyView component with a message indicating that the composer is disabled.
 */
export const Page = () => {
  const { service: serviceName, instance } =
    useRouteParams<"InstanceComposerEditor">();
  const { featureManager } = useContext(DependencyContext);

  if (!featureManager.isComposerEnabled()) {
    return (
      <EmptyView
        message={words("inventory.instanceComposer.disabled")}
        aria-label="OrdersView-Empty"
      />
    );
  }

  return (
    <ServicesWithMainProvider
      serviceName={serviceName}
      Dependant={({ services, mainService }) => (
        <RelatedInventoriesProvider
          serviceModels={services}
          mainService={mainService}
          Dependant={({ services, mainService, relatedInventories }) => (
            <InstanceWithRelationsProvider
              instanceId={instance}
              Dependant={({ instance }) => (
                <PageWrapper>
                  <Canvas
                    instance={instance}
                    services={services}
                    mainService={mainService}
                    serviceInventories={relatedInventories}
                    editable
                  />
                </PageWrapper>
              )}
            />
          )}
        />
      )}
    />
  );
};

/**
 * PageWrapper component.
 * Wraps the content of the Page component with a PageContainer.
 */
const PageWrapper: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
  ...props
}) => (
  <PageContainer
    {...props}
    pageTitle={words("inventory.instanceComposer.title.edit")}
  >
    {children}
  </PageContainer>
);
