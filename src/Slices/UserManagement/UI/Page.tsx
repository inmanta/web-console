import React, { useState } from "react";
import { Button, Flex, FlexItem } from "@patternfly/react-core";
import { Table, Tbody, Th, Thead, Tr } from "@patternfly/react-table";
import { useGetUsers } from "@/Data/Managers/V2/GETTERS/GetUsers";
import { words } from "@/UI";
import {
  EmptyView,
  ErrorView,
  LoadingView,
  PageContainer,
} from "@/UI/Components";
import { AddUserModal } from "./Components/AddUserModal";
import { UserInfoRow } from "./Components/UserInfoRow";

export const UserManagementPage: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data, isLoading, isError, error, refetch } =
    useGetUsers().useOneTime();

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
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
      <Flex justifyContent={{ default: "justifyContentFlexEnd" }}>
        <FlexItem>
          <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
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
