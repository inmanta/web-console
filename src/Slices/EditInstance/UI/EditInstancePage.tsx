import React, { PropsWithChildren } from "react";
import { ServiceModel } from "@/Core";
import { useGetInstance } from "@/Data/Queries";
import { Description, ErrorView, LoadingView } from "@/UI/Components";
import { words } from "@/UI/words";
import { EditForm } from "./EditForm";

/**
 * EditInstancePage component is responsible for rendering the edit page of a service instance.
 * It fetches the instance data using the `useGetInstance` hook and displays the appropriate view
 * based on the fetch status (loading, error, or success).
 *
 * @component
 *
 * @props {Props} props - The properties object.
 * @prop {ServiceModel} props.serviceEntity - The service entity model.
 * @prop {string} props.instanceId - The ID of the instance to be edited.
 *
 * @returns {React.FC<Props>} The rendered component.
 */
export const EditInstancePage: React.FC<{
  serviceEntity: ServiceModel;
  instanceId: string;
}> = ({ serviceEntity, instanceId }) => {
  const { data, isError, error, isSuccess } = useGetInstance(
    serviceEntity.name,
    instanceId
  ).useContinuous();

  if (isError) {
    return (
      <Wrapper id={instanceId}>
        <ErrorView message={error.message} ariaLabel="EditInstance-Failed" />
      </Wrapper>
    );
  }

  if (isSuccess) {
    const { service_identity_attribute_value } = data;
    const identifier = service_identity_attribute_value
      ? service_identity_attribute_value
      : instanceId;

    return (
      <Wrapper id={identifier}>
        <div aria-label="EditInstance-Success">
          <EditForm instance={data} serviceEntity={serviceEntity} />
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper id={instanceId}>
      <LoadingView ariaLabel="EditInstance-Loading" />
    </Wrapper>
  );
};

const Wrapper: React.FC<PropsWithChildren<{ id: string }>> = ({ id, children }) => {
  return (
    <>
      <Description withSpace>{words("inventory.duplicateInstance.header")(id)}</Description>
      {children}
    </>
  );
};
