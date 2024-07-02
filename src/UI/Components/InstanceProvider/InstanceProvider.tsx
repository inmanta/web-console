import React, { useContext } from "react";
import { ServiceModel } from "@/Core";
import { useGetInstanceWithRelations } from "@/Data/Managers/V2/GetInstanceWithRelations";
import { useGetMetadata } from "@/Data/Managers/V2/GetMetadata";
import { DependencyContext, words } from "@/UI";
import { ErrorView, LoadingView } from "@/UI/Components";
import Canvas from "@/UI/Components/Diagram/Canvas";

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
  const { environmentHandler } = useContext(DependencyContext);
  const environment = environmentHandler.useId();

  const instanceWithRelations = useGetInstanceWithRelations(
    instanceId,
    environment,
  ).useOneTime();
  const instanceVersion = instanceWithRelations.data?.instance.version;
  const metadata = useGetMetadata(
    environment,
    mainServiceName,
    instanceId,
    "coordinates",
    instanceVersion,
  ).useOneTime();

  if (instanceWithRelations.isLoading || metadata.isLoading) {
    return <LoadingView aria-label="instance_composer_editor-loading" />;
  }

  if (instanceWithRelations.isError || metadata.isError) {
    const retryFn = instanceWithRelations.isError
      ? instanceWithRelations.refetch
      : metadata.refetch;

    const error = instanceWithRelations.isError
      ? instanceWithRelations.error
      : metadata.error;

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
  const { data } = instanceWithRelations;

  return (
    <Canvas
      services={services}
      mainServiceName={mainServiceName}
      instance={
        data ? { ...data, coordinates: metadata?.data || "" } : undefined
      }
      editable={editable}
    />
  );
};
