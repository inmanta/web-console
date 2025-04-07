import React, { useContext } from "react";
import { Button, Flex, FlexItem } from "@patternfly/react-core";
import { Table, Tbody, Th, Thead, Tr } from "@patternfly/react-table";
import { useGetUsers } from "@/Data/Managers/V2/Auth";
import { UserCredentialsForm } from "@/Slices/UserManagement/UI/Components/AddUserForm";
import { words } from "@/UI";
import {
  EmptyView,
  ErrorView,
  LoadingView,
  PageContainer,
} from "@/UI/Components";
import { ModalContext } from "@/UI/Root/Components/ModalProvider";
import { UserInfoRow } from "./Components/UserInfoRow";

export const UserManagementPage: React.FC = () => {
  const { triggerModal } = useContext(ModalContext);

  const { data, isLoading, isError, error, refetch } =
    useGetUsers().useOneTime();

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

  if (isLoading) return <LoadingView ariaLabel="UserManagement-Loading" />;

  if (isError)
    return (
      <ErrorView
        data-testid="ErrorView"
        title={words("error")}
        message={words("error.general")(error.message)}
        ariaLabel="UserManagement-Failed"
        retry={refetch}
      />
    );

  return (
    <PageContainer pageTitle={words("userManagement.title")}>
      <Flex justifyContent={{ default: "justifyContentFlexEnd" }}>
        <FlexItem>
          <Button
            variant="primary"
            onClick={openModal}
            aria-label="add_user-button"
          >
            {words("userManagement.addUser")}
          </Button>
        </FlexItem>
      </Flex>
      {!data || data.length === 0 ? (
        <EmptyView
          message={words("userManagement.empty.message")}
          aria-label="UserManagement-Empty"
        />
      ) : (
        <Table aria-label="users-table">
          <Thead>
            <Tr>
              <Th width={80}>{words("userManagement.name")}</Th>
              <Th width={20}>{words("userManagement.actions")}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.map((user) => (
              <UserInfoRow key={`Row-${user.username}`} user={user} />
            ))}
          </Tbody>
        </Table>
      )}
    </PageContainer>
  );
};
