import React, { useContext, useState } from "react";
import { AlertVariant, Button, Flex, FlexItem } from "@patternfly/react-core";
import { Table, Tbody, Th, Thead, Tr } from "@patternfly/react-table";
import { useGetEnvironmentPreview, useGetRoles, useGetUsers } from "@/Data/Queries";
import { UserCredentialsForm } from "@/Slices/UserManagement/UI/Components/AddUserForm";
import { words } from "@/UI";
import { EmptyView, ErrorView, LoadingView, PageContainer, ToastAlert } from "@/UI/Components";
import { ModalContext } from "@/UI/Root/Components/ModalProvider";
import { UserRow } from "./Components/UserRow";

export const UserManagementPage: React.FC = () => {
  const { triggerModal } = useContext(ModalContext);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertTitle, setAlertTitle] = useState<string>(words("success"));
  const [alertVariant, setAlertVariant] = useState<AlertVariant>(AlertVariant.success);
  const users = useGetUsers().useOneTime();
  const roles = useGetRoles().useOneTime();
  const environments = useGetEnvironmentPreview().useOneTime();

  /**
   * Sets the alert message.
   *
   * @param {string} title - The title of the alert.
   * @param {AlertVariant} variant - The variant of the alert.
   * @param {string} message - The message of the alert.
   */
  const setAlert = (title: string, variant: AlertVariant, message: string) => {
    setAlertTitle(title);
    setAlertVariant(variant);
    setAlertMessage(message);
  };

  /**
   * Opens a modal with a form for user credentials.
   */
  const openModal = () => {
    triggerModal({
      title: words("userManagement.addUser"),
      content: (
        <UserCredentialsForm
          submitButtonText={words("userManagement.addUser")}
          submitButtonLabel={"confirm-button"}
        />
      ),
    });
  };

  if (users.isError || environments.isError || roles.isError) {
    const errorMessage =
      users.error?.message || environments.error?.message || roles.error?.message || "";

    const retry = () => {
      if (users.isError) {
        users.refetch();
      }
      if (environments.isError) {
        environments.refetch();
      }
      if (roles.isError) {
        roles.refetch();
      }
    };

    return (
      <ErrorView
        data-testid="ErrorView"
        title={words("error")}
        message={words("error.general")(errorMessage)}
        ariaLabel="UserManagement-Failed"
        retry={retry}
      />
    );
  }

  if (environments.isSuccess && users.isSuccess && roles.isSuccess) {
    return (
      <PageContainer pageTitle={words("userManagement.title")}>
        {alertMessage && (
          <ToastAlert
            title={alertTitle}
            type={alertVariant}
            message={alertMessage}
            setMessage={setAlertMessage}
          />
        )}
        <Flex justifyContent={{ default: "justifyContentFlexEnd" }}>
          <FlexItem>
            <Button variant="primary" onClick={openModal} aria-label="add_user-button">
              {words("userManagement.addUser")}
            </Button>
          </FlexItem>
        </Flex>
        {users.data.length === 0 ? (
          <EmptyView
            message={words("userManagement.empty.message")}
            aria-label="UserManagement-Empty"
          />
        ) : (
          <Table aria-label="users-table">
            <Thead>
              <Tr>
                <Th
                  style={{ width: "15px" }}
                  aria-hidden
                  screenReaderText={words("common.emptyColumnHeader")}
                />
                <Th width={40}>{words("userManagement.name")}</Th>
                <Th width={40}>{words("userManagement.roles")}</Th>
                <Th
                  isStickyColumn
                  stickyMinWidth="340px"
                  aria-hidden
                  screenReaderText={words("common.emptyColumnHeader")}
                />
              </Tr>
            </Thead>
            <Tbody>
              {users.data.map((user) => (
                <UserRow
                  key={`Row-${user.username}`}
                  user={user}
                  allRoles={roles.data}
                  setAlert={setAlert}
                  environments={environments.data.environments}
                />
              ))}
            </Tbody>
          </Table>
        )}
      </PageContainer>
    );
  }

  return <LoadingView ariaLabel="UserManagement-Loading" />;
};
