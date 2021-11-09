import React, { useContext } from "react";
import { RemoteData, ServiceModel } from "@/Core";
import { ErrorView, LoadingView } from "@/UI/Components";
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

  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => <LoadingView aria-label="EditInstance-Loading" />,
      failed: (message) => (
        <ErrorView aria-label="EditInstance-Failed" message={message} />
      ),
      success: (instance) => {
        return (
          <div aria-label="EditInstance-Success">
            <EditForm instance={instance} serviceEntity={serviceEntity} />
          </div>
        );
      },
    },
    data
  );
};
