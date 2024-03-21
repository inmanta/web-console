import React from "react";
import { Button } from "@patternfly/react-core";
import { Td, Tr } from "@patternfly/react-table";
import { UserInfo } from "@/Data/Managers/V2/GetUsers";
import { useRemoveUser } from "@/Data/Managers/V2/RemoveUser";
import { words } from "@/UI";

function UserInfoRow({ user }: { user: UserInfo }) {
  const { mutate } = useRemoveUser();

  return (
    <Tr aria-label={`row-${user.username}`}>
      <Td dataLabel={user.username}>{user.username}</Td>
      <Td dataLabel={`${user.username}-actions`}>
        <Button variant="danger" onClick={() => mutate(user.username)}>
          {words("delete")}
        </Button>
      </Td>
    </Tr>
  );
}

export default UserInfoRow;
