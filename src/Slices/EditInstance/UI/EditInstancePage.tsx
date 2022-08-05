import React, { useContext } from "react";
import { ServiceModel } from "@/Core";
import { RemoteDataView, ServiceInstanceDescription } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
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
    <>
      <ServiceInstanceDescription
        instanceId={instanceId}
        serviceName={serviceEntity.name}
        getDescription={words("inventory.editInstance.header")}
        data={data}
        withSpace
      />
      <RemoteDataView
        data={data}
        label="EditInstance"
        SuccessView={(instance) => (
          <div aria-label="EditInstance-Success">
            <EditForm instance={instance} serviceEntity={serviceEntity} />
          </div>
        )}
      />
    </>
  );
};
