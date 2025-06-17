import React, { useContext, useState } from "react";
import { AlertVariant, Button, Flex, FlexItem } from "@patternfly/react-core";
import { Table, Tbody, Th, Thead, Tr } from "@patternfly/react-table";
import { useGetUsers } from "@/Data/Queries";
import { UserCredentialsForm } from "@/Slices/UserManagement/UI/Components/AddUserForm";
import { words } from "@/UI";
import { EmptyView, ErrorView, LoadingView, PageContainer, ToastAlert } from "@/UI/Components";
import { ModalContext } from "@/UI/Root/Components/ModalProvider";
import { UserInfoRow } from "./Components/UserInfoRow";

export const UserManagementPage: React.FC = () => {
  const { triggerModal } = useContext(ModalContext);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const { data, isSuccess, isError, error, refetch } = useGetUsers().useOneTime();

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

  if (isError) {
    return (
      <ErrorView
        data-testid="ErrorView"
        title={words("error")}
        message={words("error.general")(error.message)}
        ariaLabel="UserManagement-Failed"
        retry={refetch}
      />
    );
  }

  if (isSuccess) {
    return (
      <PageContainer pageTitle={words("userManagement.title")}>
        {alertMessage && (
          <ToastAlert
            title={words("success")}
            type={AlertVariant.success}
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
        {data.length === 0 ? (
          <EmptyView
            message={words("userManagement.empty.message")}
            aria-label="UserManagement-Empty"
          />
        ) : (
          <Table aria-label="users-table">
            <Thead>
              <Tr>
                <Th width={80}>{words("userManagement.name")}</Th>
                <Th isStickyColumn stickyMinWidth="420px">
                  {words("userManagement.actions")}
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.map((user) => (
                <UserInfoRow
                  key={`Row-${user.username}`}
                  user={user}
                  setAlertMessage={setAlertMessage}
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
