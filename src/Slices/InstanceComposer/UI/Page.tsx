import React, { useContext } from "react";
import { ServiceModel } from "@/Core";
import { useGetRelatedInventories } from "@/Data/Managers/V2/GetRelatedInventories";
import { useGetServiceModels } from "@/Data/Managers/V2/GetServiceModels";
import { DependencyContext, useRouteParams, words } from "@/UI";
import {
  EmptyView,
  ErrorView,
  LoadingView,
  PageContainer,
} from "@/UI/Components";
import Canvas from "@/UI/Components/Diagram/Canvas";
import { findInterServiceRelations } from "@/UI/Components/Diagram/helpers";

/**
 * Renders the Page component for the Instance Composer Page.
 * If the composer feature is enabled, it renders the Canvas.
 * If the composer feature is disabled, it renders an EmptyView component with a message indicating that the composer is disabled.
 */
export const Page = () => {
  const { service: serviceName } = useRouteParams<"InstanceComposer">();
  const { featureManager, environmentHandler } = useContext(DependencyContext);
  const environment = environmentHandler.useId();

  if (!featureManager.isComposerEnabled()) {
    <EmptyView
      message={words("inventory.instanceComposer.disabled")}
      aria-label="ComposersView-Empty"
    />;
  }

  const serviceModels = useGetServiceModels(environment).useOneTime();
  const mainService = serviceModels.data?.find(
    (service) => service.name === serviceName,
  );

  if (mainService === undefined) {
    <EmptyView
      message={words("inventory.instanceComposer.noMainService")(serviceName)}
      aria-label="ComposersView-Empty"
    />;
  }

  const relatedCatalogsNames = findInterServiceRelations(mainService);
  const relatedServiceModels =
    serviceModels.data?.filter((service) =>
      relatedCatalogsNames?.includes(service.name),
    ) || [];
  const relatedCatalogs = useGetRelatedInventories(
    relatedCatalogsNames,
    environment,
  ).useOneTime();

  if (serviceModels.isLoading || relatedCatalogs.isLoading) {
    return <LoadingView aria-label="ComposersView-loading" />;
  }

  if (serviceModels.isError || relatedCatalogs.isError) {
    const retryFn = serviceModels.isError
      ? serviceModels.refetch
      : relatedCatalogs.refetch;
    const error = serviceModels.error || relatedCatalogs.error;
    const errorMessage = error ? error.message : "";
    return (
      <ErrorView
        data-testid="ErrorView"
        title={words("error")}
        message={words("error.general")(errorMessage)}
        aria-label="ComposersView-failed"
        retry={retryFn}
      />
    );
  }

  return (
    <PageWrapper>
      <Canvas
        services={[...relatedServiceModels, mainService as ServiceModel]}
        mainService={mainService as ServiceModel}
        serviceInventories={relatedCatalogs.data || {}}
        editable
      />
    </PageWrapper>
  );
};

/**
 * Wrapper component for the Page component.
 * Renders the PageContainer component with the provided props and children.
 */
const PageWrapper: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
  ...props
}) => (
  <PageContainer
    aria-label="Composer"
    {...props}
    pageTitle={words("inventory.instanceComposer.title")}
  >
    {children}
  </PageContainer>
);
