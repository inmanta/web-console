import React, { useContext, useState } from "react";
import { Button, Flex, FlexItem } from "@patternfly/react-core";
import { UserShieldIcon } from "@patternfly/react-icons";
import { Td, Tr } from "@patternfly/react-table";
import { useRemoveUser, UserInfo } from "@/Data/Queries";
import { words } from "@/UI";
import { ConfirmUserActionForm } from "@/UI/Components";
import { ModalContext } from "@/UI/Root/Components/ModalProvider";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { NestedUserRoleTable } from "./NestedUserRoleTable";

interface Props {
  user: UserInfo;
  setAlertMessage: (message: string) => void;
}

/**
 * A functional component that renders a row in the user information table.
 * @props {Props} props - The props of the component.
 * @prop {UserInfo} user - The user information.
 *
 * @returns {React.FC<Props>} The rendered user info row with button to be able to delete the user.
 */
export const UserInfoRow: React.FC<Props> = ({ user, setAlertMessage }) => {
  const { triggerModal, closeModal } = useContext(ModalContext);
  const authConfig = globalThis && globalThis.auth;
  const showRoles = authConfig?.provider === "policy-engine" && authConfig?.method === "database";
  const [isExpanded, setIsExpanded] = useState(false);

  const { mutate } = useRemoveUser();

  /**
   * Opens a modal with a confirmation form for deleting a user.
   *
   * @returns {void}
   */
  const openDeleteModal = (): void => {
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

  /**
   * Opens a modal with a confirmation form for changing the password of a user.
   *
   * @returns {void}
   */
  const openChangePasswordModal = (): void => {
    triggerModal({
      title: words("userManagement.changePassword"),
      content: (
        <Flex direction={{ default: "column" }} gap={{ default: "gapSm" }}>
          <FlexItem>
            <p>{words("userManagement.changePassword.message")(user.username)}</p>
          </FlexItem>
          <FlexItem>
            <ChangePasswordForm user={user.username} setAlertMessage={setAlertMessage} />
          </FlexItem>
        </Flex>
      ),
    });
  };

  return [
    <Tr aria-label={`row-${user.username}`} data-testid="user-row">
      <Td dataLabel={user.username}>
        {user.is_admin && (
          <>
            <UserShieldIcon />{" "}
          </>
        )}
        {user.username}
      </Td>
      {showRoles && (
        <Td dataLabel={words("userManagement.roles")}>
          <Button variant="link" onClick={() => setIsExpanded(!isExpanded)} isInline>
            {Object.keys(user.roles).length > 0
              ? [...new Set(Object.values(user.roles).flat())].join(", ")
              : words("userManagement.roles.none")}
          </Button>
        </Td>
      )}
      <Td id={`${user.username}-actions`} dataLabel={words("userManagement.actions")}>
        <Flex justifyContent={{ default: "justifyContentFlexEnd" }}>
          <FlexItem>
            <Button variant="primary" onClick={openChangePasswordModal} size="sm">
              {words("userManagement.changePassword")}
            </Button>
          </FlexItem>
          <FlexItem>
            <Button variant="danger" onClick={openDeleteModal} size="sm">
              {words("delete")}
            </Button>
          </FlexItem>
        </Flex>
      </Td>
    </Tr>,
    showRoles && isExpanded && (
      <Tr aria-label={`expanded-row-${user.username}`} isStriped>
        <Td colSpan={3}>
          <NestedUserRoleTable {...user} />
        </Td>
      </Tr>
    ),
  ];
};
