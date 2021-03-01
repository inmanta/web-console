import { useStoreState } from "@/UI/Store";
import React from "react";
import { useParams } from "react-router-dom";
import { ServiceInstanceHistory } from "./ServiceInstanceHistory";

interface Params {
  serviceId: string;
  instanceId: string;
}

export const Provider: React.FC = () => {
  const { serviceId, instanceId } = useParams<Params>();
  const environmentId = useStoreState(
    (store) => store.environments.getSelectedEnvironment.id
  );

  return environmentId ? (
    <ServiceInstanceHistory
      serviceId={serviceId}
      instanceId={instanceId}
      env={environmentId}
    />
  ) : (
    <div>no env</div>
  );
};
