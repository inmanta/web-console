import React, { useContext } from "react";
import { ServiceModel } from "@/Core";
import { RemoteDataView } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { EditForm } from "./EditForm";

export const EditInstancePage: React.FC<{
  serviceEntity: ServiceModel;
  instanceId: string;
}> = ({ serviceEntity, instanceId }) => {
  const { queryResolver } = useContext(DependencyContext);

  const [data] = queryResolver.useContinuous<"GetServiceInstance">({
    kind: "GetServiceInstance",
    service_entity: serviceEntity.name,
    id: instanceId,
  });

  return (
    <RemoteDataView
      data={data}
      label="EditInstance"
      SuccessView={(instance) => (
        <div aria-label="EditInstance-Success">
          <EditForm instance={instance} serviceEntity={serviceEntity} />
        </div>
      )}
    />
  );
};
