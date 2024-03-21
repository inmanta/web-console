import React, { useEffect } from "react";
import { Modal } from "@patternfly/react-core";
import { useAddUser } from "@/Data/Managers/V2/AddUser";
import { words } from "@/UI";
import UserCredentialsForm from "@/UI/Components/UserCredentialsForm";

interface AddUserModalProps {
  // Define your props here
  isOpen: boolean;
  onClose: () => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose }) => {
  const { mutate, isSuccess, isPending, isError, error } = useAddUser();
  // Implement your component logic here
  useEffect(() => {
    if (isSuccess) {
      // close the modal
      onClose();
    }
  }, [isSuccess, onClose]);
  return (
    // JSX code for your modal component
    <Modal
      isOpen={isOpen}
      aria-label={`modal-add_user`}
      title={words("userManagement.addUser")}
    >
      <UserCredentialsForm
        isError={isError}
        isPending={isPending}
        error={error}
        onSubmit={(username, password) => mutate({ username, password })}
        submitButtonText={words("userManagement.addUser")}
      />
    </Modal>
  );
};

export default AddUserModal;
