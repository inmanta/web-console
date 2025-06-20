import React from "react";
import { AlertVariant, Button, Spinner } from "@patternfly/react-core";
import { Td } from "@patternfly/react-table";
import { UseQueryResult } from "@tanstack/react-query";
import { UserRoleInfo } from "@/Data/Queries";
import { words } from "@/UI";

interface Props {
  roles: UseQueryResult<UserRoleInfo[], Error>;
  setAlert: (title: string, variant: AlertVariant, message: string) => void;
}

/**
 * A functional component that renders the top column of the role table.
 * @param {UseQueryResult<UserRoleInfo[], Error>} roles - The roles of the user.
 * @returns {React.FC<Props>} The rendered role top column.
 */
export const RolesMainColumn = ({ roles, setAlert }: Props) => {
  /**
   * Refetch the roles and clears the alert.
   *
   * @returns {void}
   */
  const onRetry = (): void => {
    roles.refetch();
    setAlert("", AlertVariant.danger, ""); //
  };

  if (roles.isSuccess) {
    return (
      <Td dataLabel={words("userManagement.roles")} aria-label="roles-success">
        {[...new Set(roles.data.map((role) => role.name))].join(", ")}
      </Td>
    );
  }

  if (roles.isError) {
    return (
      <Td dataLabel={words("userManagement.roles")} aria-label="roles-error">
        <Button variant="link" onClick={onRetry}>
          {words("retry")}
        </Button>
      </Td>
    );
  }

  return (
    <Td dataLabel={words("userManagement.roles")} aria-label="roles-loading">
      <Spinner size="sm" />
    </Td>
  );
};
