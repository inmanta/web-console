import React, { useState } from "react";
import { Button } from "@patternfly/react-core";
import { Td, Tr } from "@patternfly/react-table";
import { UserInfo } from "@/Data/Managers/V2/GetUsers";
import { words } from "@/UI";
import { DeleteUserModal } from "./DeleteUserModal";

interface UserInfoRowProps {
  user: UserInfo;
}

export const UserInfoRow: React.FC<UserInfoRowProps> = ({ user }) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const onDelete = () => {
    setIsDeleteModalOpen(true);
  };

  return (
    <Tr aria-label={`row-${user.username}`}>
      <Td dataLabel={user.username}>{user.username}</Td>
      <Td dataLabel={`${user.username}-actions`}>
        <Button variant="danger" onClick={() => onDelete()}>
          {words("delete")}
        </Button>
      </Td>
      <DeleteUserModal
        user={user}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </Tr>
  );
};
