import React, { PropsWithChildren } from 'react';
import { ServiceModel } from '@/Core';
import { useGetInstance } from '@/Data/Managers/V2/ServiceInstance';
import { Description, ErrorView, LoadingView } from '@/UI/Components';
import { words } from '@/UI/words';
import { DuplicateForm } from './DuplicateForm';

/**
 * DuplicateInstancePage component fetches the instance data based on the provided service entity and instance ID.
 * It displays an error view if there's an error, a loading view while fetching data, and a form to duplicate the instance upon successful data retrieval.
 *
 * @props {Props} props - The properties object.
 * @prop {ServiceModel} props.serviceEntity - The service entity model.
 * @prop {string} props.instanceId - The ID of the instance to be duplicated.
 * @returns {React.FC<Props>} The rendered component.
 */
export const DuplicateInstancePage: React.FC<{
  serviceEntity: ServiceModel;
  instanceId: string;
}> = ({ serviceEntity, instanceId }) => {
  const { data, isError, error, isSuccess } = useGetInstance(
    serviceEntity.name,
    instanceId,
  ).useContinuous();

  if (isError) {
    return (
      <ErrorView ariaLabel="DuplicateInstance-Failed" message={error.message} />
    );
  }

  if (isSuccess) {
    const { service_identity_attribute_value } = data;
    const identifier = service_identity_attribute_value
      ? service_identity_attribute_value
      : instanceId;

    return (
      <Wrapper id={identifier}>
        <div aria-label="DuplicateInstance-Success">
          <DuplicateForm instance={data} serviceEntity={serviceEntity} />
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper id={instanceId}>
      <LoadingView ariaLabel="DuplicateInstance-Loading" />
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
        {words('inventory.duplicateInstance.header')(id)}
      </Description>
      {children}
    </>
  );
};
