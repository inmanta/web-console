import React, { useContext } from "react";
import { Button } from "@patternfly/react-core";
import { Td, Tr } from "@patternfly/react-table";
import { useRemoveUser, UserInfo } from "@/Data/Managers/V2/Auth";
import { words } from "@/UI";
import { ConfirmUserActionForm } from "@/UI/Components";
import { ModalContext } from "@/UI/Root/Components/ModalProvider";

interface Props {
  user: UserInfo;
}

/**
 * A functional component that renders a row in the user information table.
 * @props {Props} props - The props of the component.
 * @prop {UserInfo} user - The user information.
 *
 * @returns {React.FC<Props>} The rendered user info row with button to be able to delete the user.
 */
export const UserInfoRow: React.FC<Props> = ({ user }) => {
  const { triggerModal, closeModal } = useContext(ModalContext);
  const { mutate } = useRemoveUser();

  /**
   * Opens a modal with a confirmation form.
   *
   * @returns {void}
   */
  const openModal = (): void => {
    triggerModal({
      title: words("userManagement.deleteUser.title"),
      content: (
        <>
          <p>{words("userManagement.deleteUserMessage")(user.username)}</p>
          <ConfirmUserActionForm
            onSubmit={() => {
              mutate(user.username);
              closeModal();
            }}
            onCancel={closeModal}
          />
        </>
      ),
    });
  };

  return (
    <Tr aria-label={`row-${user.username}`} data-testid="user-row">
      <Td dataLabel={user.username}>{user.username}</Td>
      <Td dataLabel={`${user.username}-actions`}>
        <Button variant="danger" onClick={openModal}>
          {words("delete")}
        </Button>
      </Td>
    </Tr>
  );
};
