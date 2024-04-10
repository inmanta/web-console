/**
 * Renders the InstanceProvider component.
 *
 * @param {ServiceModel[]} services - The list of service models.
 * @param {string} mainServiceName - The name of the main service.
 * @param {string} instanceId - The ID of the instance.
 * @returns {JSX.Element} The rendered InstanceProvider component.
 */
import React, { useContext } from "react";
import { ServiceModel } from "@/Core";
import { useGetInstanceWithRelations } from "@/Data/Managers/V2/GetInstanceWithRelations";
import { DependencyContext, words } from "@/UI";
import { ErrorView, LoadingView } from "@/UI/Components";
import Canvas from "@/UI/Components/Diagram/Canvas";

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

  if (isLoading) {
    return <LoadingView aria-label="instance_composer_editor-loading" />;
  }

  if (isError) {
    <ErrorView
      data-testid="ErrorView"
      title={words("error")}
      message={words("error.general")(error.message)}
      aria-label="instance_composer_editor-failed"
      retry={refetch}
    />;
  }

  return (
    <Canvas
      services={services}
      mainServiceName={mainServiceName}
      instance={data}
      editable={editable}
    />
  );
};
