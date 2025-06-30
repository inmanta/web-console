import React from "react";
import { Button } from "@patternfly/react-core";
import { Td } from "@patternfly/react-table";
import { UserRole } from "@/Data/Queries";
import { words } from "@/UI";

interface Props {
  roles: UserRole[];
  toggle: () => void;
}

/**
 * A functional component that renders the togglable cell of the role table.
 * It is used to toggle the roles of the user.
 *
 * @prop {UserRole} roles - The roles of the user.
 * @prop {Function} toggle - The function to toggle the roles.
 * @returns {React.FC<Props>} The rendered role top column.
 */
export const RolesToggleCell: React.FC<Props> = ({ roles, toggle }) => {
  return (
    <Td dataLabel={words("userManagement.roles")} aria-label="roles-success">
      <Button variant="link" onClick={toggle}>
        {roles.length > 0
          ? [...new Set(roles.map((role) => role.role))].join(", ")
          : words("userManagement.noRolesAssigned")}
      </Button>
    </Td>
  );
};
