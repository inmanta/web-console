import React, { useContext } from "react";
import { ServiceModel } from "@/Core";
import { useGetInstanceWithRelations } from "@/Data/Managers/V2/GetInstanceWithRelations";
import { DependencyContext, words } from "@/UI";
import { ErrorView, LoadingView } from "@/UI/Components";
import Canvas from "@/UI/Components/Diagram/Canvas";

export const InstanceProvider: React.FC<{
  services: ServiceModel[];
  mainServiceName: string;
  instanceId: string;
}> = ({ services, mainServiceName, instanceId }) => {
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
    />
  );
};
