import React from "react";
import { Modal } from "@patternfly/react-core";
import { UserInfo } from "@/Data/Managers/V2/GetUsers";
import { useRemoveUser } from "@/Data/Managers/V2/RemoveUser";
import { words } from "@/UI";
import { ConfirmUserActionForm } from "@/UI/Components";

interface Props {
  user: UserInfo;
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteUserModal: React.FC<Props> = ({ user, isOpen, onClose }) => {
  const { mutate } = useRemoveUser();

  return (
    <Modal
      isOpen={isOpen}
      aria-label="DeleteUserModal"
      title={words("userManagement.deleteUser.title")}
      variant="small"
      disableFocusTrap
      onClose={onClose}
    >
      <p>{words("userManagement.deleteUserMessage")(user.username)}</p>

      <ConfirmUserActionForm
        onSubmit={() => mutate(user.username)}
        onCancel={onClose}
      />
    </Modal>
  );
};
