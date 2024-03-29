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

/**
 * DeleteUserModal component displays a modal for confirming deleting an user.
 *
 * @component
 * @param {Props} props - The component props.
 * @param {User} props.user - The user to be deleted.
 * @param {boolean} props.isOpen - Indicates whether the modal is open or not.
 * @param {() => void} props.onClose - Callback function to close the modal.
 * @returns {JSX.Element} The DeleteUserModal component.
 */
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
