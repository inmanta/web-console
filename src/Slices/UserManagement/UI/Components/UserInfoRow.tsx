import React, { useContext, useEffect, useState } from "react";
import { AlertVariant, Button, Flex, FlexItem } from "@patternfly/react-core";
import { Table, Th, Thead, Td, Tr, Tbody } from "@patternfly/react-table";
import { EnvironmentPreview, useGetUserRoles, useRemoveUser, UserInfo } from "@/Data/Queries";
import { words } from "@/UI";
import { ConfirmUserActionForm, EmptyView, Toggle } from "@/UI/Components";
import { ModalContext } from "@/UI/Root/Components/ModalProvider";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { RoleRow } from "./RoleRow";
import { RolesToggleCell } from "./RolesToggleCell";

interface Props {
  user: UserInfo;
  environments: EnvironmentPreview[];
  allRoles: string[];
  setAlert: (title: string, variant: AlertVariant, message: string) => void;
}

/**
 * A functional component that renders a row in the user information table.
 * @props {Props} props - The props of the component.
 * @prop {UserInfo} user - The user information.
 *
 * @returns {React.FC<Props>} The rendered user info row with button to be able to delete the user.
 */
export const UserInfoRow: React.FC<Props> = ({ user, allRoles, environments, setAlert }) => {
  const roles = useGetUserRoles().useOneTime(user.username);
  const [isExpanded, setIsExpanded] = useState(false);
  const { triggerModal, closeModal } = useContext(ModalContext);
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
            <ChangePasswordForm user={user.username} setAlert={setAlert} />
          </FlexItem>
        </Flex>
      ),
    });
  };

  const onToggle = (): void => setIsExpanded(!isExpanded);

  useEffect(() => {
    if (roles.isError) {
      setAlert(words("error"), AlertVariant.danger, words("error.general")(roles.error.message));
    }
  }, [roles.isError, roles.error, setAlert]);

  return (
    <>
      <Tr aria-label={`row-${user.username}`} data-testid="user-row">
        <Td>
          <Toggle expanded={isExpanded} onToggle={onToggle} aria-label={"Toggle-user-row"} />
        </Td>
        <Td dataLabel={user.username}>{user.username}</Td>
        <RolesToggleCell roles={roles} setAlert={setAlert} toggle={onToggle} />
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
      </Tr>
      {isExpanded && (
        <Tr aria-label="Expanded-Details">
          <Td colSpan={4}>
            <Table aria-label="role-table">
              <Thead>
                <Tr>
                  <Th width={40}>{words("userManagement.environment")}</Th>
                  <Th width={60}>{words("userManagement.roles")}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {environments.length < 1 ? (
                  <Tr>
                    <Td colSpan={2}>
                      <EmptyView
                        message={words("userManagement.noEnvironments")}
                        aria-label="Environments-Empty"
                      />
                    </Td>
                  </Tr>
                ) : (
                  environments.map((environment) => (
                    <RoleRow
                      key={`${environment.name}-role-row`}
                      username={user.username}
                      environment={environment}
                      roles={roles}
                      allRoles={allRoles}
                      setAlert={setAlert}
                    />
                  ))
                )}
              </Tbody>
            </Table>
          </Td>
        </Tr>
      )}
    </>
  );
};
