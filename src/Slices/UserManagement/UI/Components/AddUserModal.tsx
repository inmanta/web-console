import React, { useEffect } from "react";
import { Modal } from "@patternfly/react-core";
import { useAddUser } from "@/Data/Managers/V2/AddUser";
import { words } from "@/UI";
import UserCredentialsForm from "@/UI/Components/UserCredentialsForm";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { mutate, isSuccess, isPending, isError, error } = useAddUser();

  useEffect(() => {
    if (isSuccess) {
      onClose();
    }
  }, [isSuccess, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      aria-label="AddUserModal"
      title={words("userManagement.addUser")}
      variant="small"
      disableFocusTrap
      onClose={onClose}
    >
      <UserCredentialsForm
        isError={isError}
        isPending={isPending}
        error={error}
        onSubmit={(username, password) => mutate({ username, password })}
        submitButtonText={words("userManagement.addUser")}
        submitButtonLabel={"add_user-button"}
      />
    </Modal>
  );
};
