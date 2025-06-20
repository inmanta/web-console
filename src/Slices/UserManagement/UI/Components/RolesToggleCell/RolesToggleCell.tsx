import React from "react";
import { AlertVariant, Button, Spinner } from "@patternfly/react-core";
import { Td } from "@patternfly/react-table";
import { UseQueryResult } from "@tanstack/react-query";
import { UserRole } from "@/Data/Queries";
import { words } from "@/UI";

interface Props {
  roles: UseQueryResult<UserRole[], Error>;
  setAlert: (title: string, variant: AlertVariant, message: string) => void;
  toggle: () => void;
}

/**
 * A functional component that renders the togglable cell of the role table.
 * It is used to toggle the roles of the user.
 *
 * @prop {UseQueryResult<UserRole[], Error>} roles - The roles of the user.
 * @prop {Function} setAlert - The function to set the alert.
 * @prop {Function} toggle - The function to toggle the roles.
 * @returns {React.FC<Props>} The rendered role top column.
 */
export const RolesToggleCell: React.FC<Props> = ({ roles, setAlert, toggle }) => {
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
        <Button variant="link" onClick={toggle}>
          {roles.data.length > 0
            ? [...new Set(roles.data.map((role) => role.name))].join(", ")
            : words("userManagement.noRolesAssigned")}
        </Button>
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
