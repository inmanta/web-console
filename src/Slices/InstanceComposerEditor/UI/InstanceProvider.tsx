import React, { useContext } from "react";
import { ServiceModel } from "@/Core";
import { DependencyContext } from "@/UI";
import { RemoteDataView } from "@/UI/Components";
import Canvas from "@/UI/Components/Diagram/Canvas";

export const InstanceProvider: React.FC<{
  services: ServiceModel[];
  mainServiceName: string;
  instanceId: string;
}> = ({ services, mainServiceName, instanceId }) => {
  const { queryResolver } = useContext(DependencyContext);

  const [data] = queryResolver.useOneTime<"GetInstanceWithRelations">({
    kind: "GetInstanceWithRelations",
    id: instanceId,
  });
  return (
    <RemoteDataView
      data={data}
      label="Instance Composer Editor"
      SuccessView={(instance) => (
        <Canvas
          services={services}
          mainServiceName={mainServiceName}
          instance={instance}
        />
      )}
    />
  );
};
