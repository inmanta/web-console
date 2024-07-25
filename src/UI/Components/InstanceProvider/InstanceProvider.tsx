import React, { useContext } from "react";
import { ServiceModel } from "@/Core";
import { useGetInstanceWithRelations } from "@/Data/Managers/V2/GetInstanceWithRelations";
import { useGetRelatedInventories } from "@/Data/Managers/V2/GetRelatedInventories";
import { DependencyContext, words } from "@/UI";
import { EmptyView, ErrorView, LoadingView } from "@/UI/Components";
import Canvas from "@/UI/Components/Diagram/Canvas";
import { findInterServiceRelations } from "../Diagram/helpers";

/**
 * Renders the InstanceProvider component.
 * It serves purpose to provide all the necessary data for the Canvas at the same time to avoid unnecessary rerenders,
 *  and extract the data fetching logic, out of the already busy component
 *
 * @param {ServiceModel[]} services - The list of service models.
 * @param {string} mainServiceName - The name of the main service.
 * @param {string} instanceId - The ID of the instance.
 * @returns {JSX.Element} The rendered InstanceProvider component.
 */
export const InstanceProvider: React.FC<{
  label: string;
  services: ServiceModel[];
  mainServiceName: string;
  instanceId: string;
  editable?: boolean;
}> = ({ services, mainServiceName, instanceId, editable = false }) => {
  const { environmentHandler, featureManager } = useContext(DependencyContext);
  const environment = environmentHandler.useId();

  const instanceWithRelations = useGetInstanceWithRelations(
    instanceId,
    environment,
  ).useOneTime();

  const mainService = services.find(
    (service) => service.name === mainServiceName,
  );

  const relatedInventoriesNames = findInterServiceRelations(mainService) || [];

  const relatedServiceModels = services.filter((service) =>
    relatedInventoriesNames?.includes(service.name),
  );

  const relatedCatalogs = useGetRelatedInventories(
    relatedInventoriesNames,
    environment,
  ).useOneTime();

  if (!featureManager.isComposerEnabled()) {
    return (
      <EmptyView
        message={words("inventory.instanceComposer.disabled")}
        aria-label="ComposersView-Empty"
      />
    );
  }

  if (instanceWithRelations.isLoading || relatedCatalogs.isLoading) {
    return <LoadingView aria-label="instance_composer_editor-loading" />;
  }

  if (instanceWithRelations.isError || relatedCatalogs.isError) {
    const retryFn = instanceWithRelations.isError
      ? instanceWithRelations.refetch
      : relatedCatalogs.refetch;

    const error = instanceWithRelations.error || relatedCatalogs.error;

    const errorMessage = error ? error.message : "";
    return (
      <ErrorView
        data-testid="ErrorView"
        title={words("error")}
        message={words("error.general")(errorMessage)}
        aria-label="instance_composer_editor-failed"
        retry={retryFn}
      />
    );
  }

  if (!instanceWithRelations.data) {
    return (
      <ErrorView
        data-testid="ErrorView"
        title={words("inventory.instanceComposer.noData.errorTitle")}
        message={words("inventory.instanceComposer.noData.errorMessage")(
          instanceId,
        )}
        aria-label="instance_composer_editor-no-data"
        retry={instanceWithRelations.refetch}
      />
    );
  }
  if (!mainService) {
    return (
      <ErrorView
        data-testid="ErrorView"
        title={words("inventory.instanceComposer.noServiceModel.errorTitle")}
        message={words(
          "inventory.instanceComposer.noServiceModel.errorMessage",
        )(mainServiceName)}
        aria-label="instance_composer_editor-no-data"
        retry={instanceWithRelations.refetch}
      />
    );
  }
  return (
    <Canvas
      services={[...relatedServiceModels, mainService]}
      mainService={mainService}
      serviceInventories={relatedCatalogs.data || {}}
      instance={{
        ...instanceWithRelations.data,
        coordinates:
          instanceWithRelations.data.instance.metadata?.coordinates || "",
      }}
      editable={editable}
    />
  );
};
