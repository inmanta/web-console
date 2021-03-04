import React from "react";
import { useParams } from "react-router-dom";
import { useStoreState } from "@/UI/Store";
import { ErrorView } from "@/UI/Components";
import { ServiceInstanceHistory } from "./ServiceInstanceHistory";
import { words } from "@/UI/words";

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
      service_entity={serviceId}
      instanceId={instanceId}
      environment={environmentId}
    />
  ) : (
    <ErrorView error={words("error.environment.missing")} delay={500} />
  );
};
