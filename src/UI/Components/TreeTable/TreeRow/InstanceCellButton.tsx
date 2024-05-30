import React, { useContext } from "react";
import { Button, Spinner } from "@patternfly/react-core";
import { RemoteData } from "@/Core";
import { DependencyContext } from "@/UI/Dependency";

interface Props {
  id: string;
  serviceName: string;
  onClick: (cellValue: string, serviceName?: string | undefined) => void;
}

export const InstanceCellButton: React.FC<Props> = ({
  id,
  serviceName,
  onClick,
}) => {
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
      success: ({ service_identity_attribute_value }) => {
        const identifier = service_identity_attribute_value
          ? service_identity_attribute_value
          : id;

        return (
          <Button
            variant="link"
            isInline
            onClick={
              serviceName
                ? () => onClick(identifier, serviceName)
                : () => onClick(identifier)
            }
          >
            {identifier}
          </Button>
        );
      },
    },
    data,
  );
};
