import React, { useContext } from "react";
import { ServiceModel } from "@/Core";
import { DependencyContext } from "@/UI";
import { RemoteDataView } from "@/UI/Components";
import Canvas from "@/UI/Components/Diagram/Canvas";

export const InstanceProvider: React.FC<{
  serviceEntity: ServiceModel;
  instanceId: string;
}> = ({ serviceEntity, instanceId }) => {
  const { queryResolver } = useContext(DependencyContext);

  const [data] = queryResolver.useOneTime<"GetServiceInstance">({
    kind: "GetServiceInstance",
    service_entity: serviceEntity.name,
    id: instanceId,
  });

  return (
    <RemoteDataView
      data={data}
      label="Instance Modifier"
      SuccessView={(instance) => (
        <Canvas service={serviceEntity} instance={instance} />
      )}
    />
  );
};
