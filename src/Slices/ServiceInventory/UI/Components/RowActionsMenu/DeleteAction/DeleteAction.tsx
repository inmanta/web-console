import React, { useContext, useState } from 'react';
import { MenuItem } from '@patternfly/react-core';
import { TrashAltIcon } from '@patternfly/react-icons';
import { useQueryClient } from '@tanstack/react-query';
import { VersionedServiceInstanceIdentifier } from '@/Core';
import { useDeleteInstance } from '@/Data/Managers/V2/ServiceInstance';
import {
  ToastAlert,
  ActionDisabledTooltip,
  ConfirmUserActionForm,
} from '@/UI/Components';
import { DependencyContext } from '@/UI/Dependency';
import { ModalContext } from '@/UI/Root/Components/ModalProvider';
import { words } from '@/UI/words';

interface Props extends VersionedServiceInstanceIdentifier {
  instance_identity: string;
  isDisabled?: boolean;
}

export const DeleteAction: React.FC<Props> = ({
  isDisabled,
  id,
  instance_identity,
  version,
  service_entity,
}) => {
  const client = useQueryClient();
  const { triggerModal, closeModal } = useContext(ModalContext);
  const [errorMessage, setErrorMessage] = useState('');
  const { environmentModifier } = useContext(DependencyContext);

  const { mutate, isPending } = useDeleteInstance(id, service_entity, version, {
    onError: (error) => {
      setErrorMessage(error.message);
    },
    onSuccess: () => {
      client.invalidateQueries({
        queryKey: ['get_instances-one_time', service_entity],
      });
      client.refetchQueries({
        queryKey: ['get_instances-continuous', service_entity],
      });
    },
  });

  const isHalted = environmentModifier.useIsHalted();

  /**
   * Opens a modal with a confirmation form.
   *
   * @returns {void}
   */
  const handleModalToggle = (): void => {
    triggerModal({
      title: words('inventory.deleteInstance.title'),
      content: (
        <>
          {words('inventory.deleteInstance.header')(
            instance_identity,
            service_entity,
          )}
          <ConfirmUserActionForm onSubmit={onSubmit} onCancel={closeModal} />
        </>
      ),
    });
  };

  /**
   * async method that is closing modal and sending out the request to delete the instance
   * if there is an error, it will set the error message accordingly
   *
   * @returns {Promise<void>} A Promise that resolves when the operation is complete.
   */
  const onSubmit = async (): Promise<void> => {
    closeModal();
    mutate();
  };

  return (
    <>
      <ToastAlert
        data-testid="ToastAlert"
        title={words('inventory.deleteInstance.failed')}
        message={errorMessage}
        setMessage={setErrorMessage}
      />
      <ActionDisabledTooltip
        isDisabled={isDisabled || isHalted}
        testingId={words('inventory.deleteInstance.button')}
        tooltipContent={
          isHalted
            ? words('environment.halt.tooltip')
            : words('inventory.statustab.actionDisabled')
        }
      >
        <MenuItem
          itemId="delete"
          onClick={handleModalToggle}
          isDisabled={isDisabled || isHalted}
          isLoading={isPending}
          icon={<TrashAltIcon />}
          {...(!isDisabled && !isHalted && { isDanger: true })}
        >
          {words('inventory.deleteInstance.button')}
        </MenuItem>
      </ActionDisabledTooltip>
    </>
  );
};
