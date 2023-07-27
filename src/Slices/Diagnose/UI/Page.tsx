import React, { useContext } from "react";
import { RemoteData } from "@/Core";
import { PageContainer, ServiceInstanceDescription } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { useRouteParams } from "@/UI/Routing";
import { words } from "@/UI/words";
import { Diagnose } from "./Diagnose";

export const Page: React.FC = () => {
  const { service, instance } = useRouteParams<"Diagnose">();
  const { queryResolver } = useContext(DependencyContext);

  const [data] = queryResolver.useContinuous<"GetServiceInstance">({
    kind: "GetServiceInstance",
    service_entity: service,
    id: instance,
  });

  return (
    <PageContainer title={words("diagnose.title")}>
      <ServiceInstanceDescription
        instanceId={instance}
        serviceName={service}
        getDescription={words("diagnose.main.subtitle")}
        data={data}
        withSpace
      />
      <Diagnose
        serviceName={service}
        instanceId={instance}
        instanceIdentity={RemoteData.withFallback(
          RemoteData.mapSuccess(
            (instanceData) =>
              instanceData.service_identity_attribute_value || instanceData.id,
            data,
          ),
          instance,
        )}
      />
    </PageContainer>
  );
};
