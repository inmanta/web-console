import React, { PropsWithChildren } from "react";
import { ServiceModel } from "@/Core";
import { useGetInstance } from "@/Data/Managers/V2/ServiceInstance";
import { Description, ErrorView, LoadingView } from "@/UI/Components";
import { words } from "@/UI/words";
import { EditForm } from "./EditForm";

export const EditInstancePage: React.FC<{
  serviceEntity: ServiceModel;
  instanceId: string;
}> = ({ serviceEntity, instanceId }) => {
  const { data, isError, error, isSuccess } = useGetInstance(
    serviceEntity.name,
    instanceId,
  ).useContinuous();

  if (isError) {
    return (
      <ErrorView ariaLabel="DuplicateInstance-Error" message={error.message} />
    );
  }
  if (isSuccess) {
    const { service_identity_attribute_value } = data;
    const identifier = service_identity_attribute_value
      ? service_identity_attribute_value
      : instanceId;

    return (
      <Wrapper id={identifier}>
        <EditForm instance={data} serviceEntity={serviceEntity} />
      </Wrapper>
    );
  }

  return (
    <Wrapper id={instanceId}>
      <LoadingView ariaLabel="EditInstance-Loading" />
    </Wrapper>
  );
};

const Wrapper: React.FC<PropsWithChildren<{ id: string }>> = ({
  id,
  children,
}) => {
  return (
    <>
      <Description withSpace>
        {words("inventory.duplicateInstance.header")(id)}
      </Description>
      {children}
    </>
  );
};
