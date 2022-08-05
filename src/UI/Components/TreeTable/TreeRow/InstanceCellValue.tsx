import React, { useContext } from "react";
import { Spinner } from "@patternfly/react-core";
import { RemoteData } from "@/Core";
import { DependencyContext } from "@/UI/Dependency";

interface Props {
  id: string;
  serviceName: string;
}

export const InstanceCellValue: React.FC<Props> = ({ id, serviceName }) => {
  const { queryResolver } = useContext(DependencyContext);
  const [data] = queryResolver.useOneTime<"GetServiceInstance">({
    kind: "GetServiceInstance",
    id,
    service_entity: serviceName,
  });
  return RemoteData.fold(
    {
      notAsked: () => null,
      failed: () => <>{id}</>,
      loading: () => <Spinner size="sm" />,
      success: ({ service_identity_attribute_value }) => (
        <>
          {service_identity_attribute_value
            ? service_identity_attribute_value
            : id}
        </>
      ),
    },
    data
  );
};
