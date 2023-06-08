import React, { useContext } from "react";
import { ServiceModel } from "@/Core";
import { DependencyContext } from "@/UI";
import { RemoteDataView } from "@/UI/Components";
import Canvas from "@/UI/Components/Diagram/Canvas";

export const InstanceProvider: React.FC<{
  services: ServiceModel[];
  mainService: string;
  instanceId: string;
}> = ({ services, mainService, instanceId }) => {
  const { queryResolver } = useContext(DependencyContext);

  const [data] = queryResolver.useOneTime<"GetServiceInstance">({
    kind: "GetServiceInstance",
    service_entity: mainService,
    id: instanceId,
  });

  return (
    <RemoteDataView
      data={data}
      label="Instance Composer Editor"
      SuccessView={(instance) => (
        <Canvas
          services={services}
          mainService={mainService}
          instance={instance}
        />
      )}
    />
  );
};
