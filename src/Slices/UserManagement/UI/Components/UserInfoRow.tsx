import React, { useState } from "react";
import { Button } from "@patternfly/react-core";
import { Td, Tr } from "@patternfly/react-table";
import { UserInfo } from "@/Data/Managers/V2/GetUsers";
import { words } from "@/UI";
import { DeleteUserModal } from "./DeleteUserModal";

interface UserInfoRowProps {
  user: UserInfo;
}

/**
 * A functional component that renders a row in the user information table.
 * @param user The user information.
 */
export const UserInfoRow: React.FC<UserInfoRowProps> = ({ user }) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  /**
   * Handles the delete button click event.
   */
  const onDelete = () => {
    setIsDeleteModalOpen(true);
  };

  return (
    <Tr aria-label={`row-${user.username}`} role="user-row">
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
