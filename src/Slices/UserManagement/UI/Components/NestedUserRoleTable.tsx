import { useState } from "react";
import {
  Alert,
  AlertGroup,
  Label,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
} from "@patternfly/react-core";
import { Flex, FlexItem } from "@patternfly/react-core";
import { Table, Tbody, Tr, Td, Thead, Th } from "@patternfly/react-table";
import { useQueryClient } from "@tanstack/react-query";
import { uniqueId } from "lodash";
import { Environment } from "@/Core/Domain/ProjectModel";
import {
  UserInfo,
  useGetEnvironments,
  useGetRoles,
  useAddRole,
  useDeleteRole,
  getUserKey,
} from "@/Data/Queries";
import { words } from "@/UI";

/**
 * A table that displays the roles of a user, for all environments.
 * @param user - The user to display the roles for.
 * @returns The table.
 */
export const NestedUserRoleTable: React.FC<UserInfo> = (user: UserInfo) => {
  // get all environments from api
  const { data: environments } = useGetEnvironments().useOneTime();

  // we need to map the environments to the roles, and display the names of the environments instead of the ids
  // we use a Map to avoid duplicates, since multiple environments can have the same set of roles for a specific user.
  const mappedEnvironments = environments?.map((environment: Environment) => ({
    id: environment.id,
    name: environment.name,
  }));

  return (
    <Table variant="compact" aria-label="Nested-Roles-Table">
      <Thead>
        <Tr>
          <Th width={40}>{words("userManagement.environment")}</Th>
          <Th width={60}>{words("userManagement.role")}</Th>
        </Tr>
      </Thead>
      <Tbody>
        {mappedEnvironments?.map((environment: { id: string; name: string }) => (
          <Tr key={environment.id}>
            <Td width={40}>{environment.name}</Td>
            <Td width={60}>
              <Flex
                alignItems={{ default: "alignItemsCenter" }}
                spaceItems={{ default: "spaceItemsSm" }}
              >
                <FlexItem>
                  <RoleSelector
                    selectedRoles={user.roles[environment.id]}
                    environmentId={environment.id}
                    username={user.username}
                  />
                </FlexItem>
                {user.roles[environment.id]?.length > 0 ? (
                  user.roles[environment.id].map((role) => (
                    <FlexItem key={role}>
                      <Label data-testid={`role-label-${role}`} color="blue">
                        {role}
                      </Label>
                    </FlexItem>
                  ))
                ) : (
                  <FlexItem>{words("userManagement.roles.none")}</FlexItem>
                )}
              </Flex>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

/**
 * A dropdown menu for the roles, multiselect and mutation hooks to update the roles.
 * @param selectedRoles - The roles that are currently selected.
 * @param environmentId - The id of the environment.
 * @param username - The username of the user.
 * @returns The dropdown menu.
 */
const RoleSelector: React.FC<{
  selectedRoles: string[];
  environmentId: string;
  username: string;
}> = ({ selectedRoles, environmentId, username }) => {
  const client = useQueryClient();
  const { data: availableRoles, isLoading: isLoadingAvailableRoles } =
    useGetRoles(environmentId).useOneTime();
  const [errors, setErrors] = useState<string[]>([]);

  const [isOpen, setIsOpen] = useState(false);

  const { mutate: addRole } = useAddRole(username, {
    onSuccess: () => {
      client.invalidateQueries({ queryKey: getUserKey.list() });
    },
    onError: (error) => {
      setErrors((prev) => [...prev, error.message]);
    },
  });
  const { mutate: deleteRole } = useDeleteRole(username, {
    onSuccess: () => {
      client.invalidateQueries({ queryKey: getUserKey.list() });
    },
    onError: (error) => {
      setErrors((prev) => [...prev, error.message]);
    },
  });

  // no roles available from the api
  if (!isLoadingAvailableRoles && !availableRoles) {
    return <>{words("userManagement.roles.unavailable")}</>;
  }

  const onSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    value: string | number | undefined
  ) => {
    // if the value is in the selectedRoles, remove it
    if (selectedRoles?.includes(value as string)) {
      deleteRole({ role: value as string, environment: environmentId });
    } else {
      addRole({ role: value as string, environment: environmentId });
    }
  };

  const menuToggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      aria-label="role-selector"
      onClick={() => setIsOpen(!isOpen)}
      isExpanded={isOpen}
    >
      {words("userManagement.roles.edit")}
    </MenuToggle>
  );

  return (
    <>
      {errors.length > 0 && (
        <AlertGroup isLiveRegion aria-live="polite" isToast>
          {errors.map((error) => (
            <Alert
              variant="danger"
              title="Error"
              key={"error-" + uniqueId()}
              timeout={5000}
              aria-label="error-message"
            >
              {error}
            </Alert>
          ))}
        </AlertGroup>
      )}
      <Select
        id="role-selector"
        isOpen={isOpen}
        toggle={menuToggle}
        onSelect={onSelect}
        onOpenChange={(nextOpen: boolean) => setIsOpen(nextOpen)}
      >
        <SelectList>
          {availableRoles?.map((role: string) => (
            <SelectOption
              key={role}
              value={role}
              hasCheckbox
              isSelected={selectedRoles?.includes(role) ?? false}
            >
              {role}
            </SelectOption>
          ))}
        </SelectList>
      </Select>
    </>
  );
};
