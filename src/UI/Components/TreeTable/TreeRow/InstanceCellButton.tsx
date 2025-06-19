import React from "react";
import { Button, Spinner } from "@patternfly/react-core";
import { useGetInstance } from "@/Data/Queries";

interface Props {
  id: string;
  serviceName: string;
  onClick: (cellValue: string, serviceName?: string | undefined, instanceId?: string) => void;
}

export const InstanceCellButton: React.FC<Props> = ({ id, serviceName, onClick }) => {
  const { data, isLoading, isError, isSuccess } = useGetInstance(serviceName, id).useOneTime();

  if (isLoading) {
    return <Spinner size="sm" />;
  }

  if (isError) {
    return <>{id}</>;
  }

  if (isSuccess) {
    const { service_identity_attribute_value } = data;
    const identifier = service_identity_attribute_value ? service_identity_attribute_value : id;

    return (
      <Button variant="link" isInline onClick={() => onClick(identifier, serviceName, id)}>
        {identifier}
      </Button>
    );
  }

  return null;
};
