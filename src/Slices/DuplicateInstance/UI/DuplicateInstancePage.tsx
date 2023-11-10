import React, { useContext } from "react";
import { ServiceModel } from "@/Core";
import { RemoteDataView, ServiceInstanceDescription } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { DuplicateForm } from "./DuplicateForm";

export const DuplicateInstancePage: React.FC<{
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
        getDescription={words("inventory.duplicateInstance.header")}
        data={data}
        withSpace
      />
      <RemoteDataView
        data={data}
        label="DuplicateInstance"
        SuccessView={(instance) => (
          <div aria-label="DuplicateInstance-Success">
            <DuplicateForm instance={instance} serviceEntity={serviceEntity} />
          </div>
        )}
      />
    </>
  );
};
