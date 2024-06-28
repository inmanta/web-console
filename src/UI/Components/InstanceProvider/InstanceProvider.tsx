import React, { useContext } from "react";
import { ServiceModel } from "@/Core";
import { useGetInstanceWithRelations } from "@/Data/Managers/V2/GetInstanceWithRelations";
import { useGetMetadata } from "@/Data/Managers/V2/GetMetadata";
import { DependencyContext, words } from "@/UI";
import { ErrorView, LoadingView } from "@/UI/Components";
import Canvas from "@/UI/Components/Diagram/Canvas";

/**
 * Renders the InstanceProvider component.
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

  const { data, isError, isLoading, error, refetch } =
    useGetInstanceWithRelations(instanceId, environment).useOneTime();
  const instanceVersion = data?.instance.version;
  const {
    data: metadata,
    isError: isMetadataError,
    isLoading: isMetadataLoading,
    error: metadataError,
    refetch: refetchMetadata,
  } = useGetMetadata(
    environment,
    mainServiceName,
    instanceId,
    instanceVersion,
    "coordinates",
  ).useOneTime();

  if (isLoading || isMetadataLoading) {
    return <LoadingView aria-label="instance_composer_editor-loading" />;
  }

  if (isError || isMetadataError) {
    const errorMessage = error
      ? error.message
      : metadataError
        ? metadataError.message
        : "";
    const retryFn = isError ? refetch : refetchMetadata;

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
