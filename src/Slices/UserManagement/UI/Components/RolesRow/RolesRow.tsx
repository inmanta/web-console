import React, { useContext } from "react";
import { AlertVariant, Flex, FlexItem, Label, Spinner } from "@patternfly/react-core";
import { Td, Tr } from "@patternfly/react-table";
import { useQueryClient } from "@tanstack/react-query";
import {
  EnvironmentPreview,
  getUserKey,
  useAddRoleToUser,
  useRemoveRoleFromUser,
  UserRole,
} from "@/Data/Queries";
import { words } from "@/UI";
import { MultiTextSelect } from "@/UI/Components";
import { ModalContext } from "@/UI/Root/Components/ModalProvider";

interface Props {
  username: string;
  environment: EnvironmentPreview;
  roles: UserRole[];
  allRoles: string[];
  setAlert: (title: string, variant: AlertVariant, message: string) => void;
}

/**
 * A functional component that renders a row in the user information table.
 * @props {Props} props - The props of the component.
 * @prop {string} username - The username of the user to remove the role from.
 * @prop {EnvironmentPreview} environment - The environment of the user within we want to add or remove the role.
 * @prop {UserRole[]} roles - The roles of the user.
 * @prop {string[]} allRoles - The all roles of the user.
 * @prop {setAlert} setAlert - The function to set the alert.
 */
export const RolesRow = ({ username, environment, roles, allRoles, setAlert }: Props) => {
  const { closeModal } = useContext(ModalContext);
  const client = useQueryClient();

  const removeRole = useRemoveRoleFromUser({
    user: username,
    options: {
      onSuccess: () => {
        closeModal();
        client.refetchQueries({ queryKey: getUserKey.list() });
      },
      onError: (error) => {
        setAlert(words("error"), AlertVariant.danger, error.message);
      },
    },
  });

  const addRole = useAddRoleToUser({
    user: username,
    options: {
      onSuccess: () => {
        closeModal();
        client.invalidateQueries({ queryKey: getUserKey.list() });
      },
      onError: (error) => {
        setAlert(words("error"), AlertVariant.danger, error.message);
      },
    },
  });

  /**
   * Handles the selection of roles.
   * @param {string | ((prevState: string[]) => string[])} selected - The selected role.
   * @param {UserRole[]} selectedRoles - The already selected roles.
   */
  const onSelect = (
    selected: string | ((prevState: string[]) => string[]),
    selectedRoles: UserRole[]
  ) => {
    if (typeof selected === "string") {
      if (selectedRoles.some((role) => role.role === selected)) {
        removeRole.mutate({ role: selected, environment: environment.id });
      } else {
        addRole.mutate({ role: selected, environment: environment.id });
      }
    }
  };

  const selectedRolesForEnvironment = roles.filter((role) => role.environment === environment.id);

  return (
    <Tr key={`Row-${environment.name}`}>
      <Td>{environment.name}</Td>
      <Td>
        <Flex>
          <FlexItem>
            <Flex>
              <FlexItem>
                <MultiTextSelect
                  toggleAriaLabel={`toggle-roles-${environment.name}`}
                  noInputField
                  isDisabled={removeRole.isPending || addRole.isPending || allRoles.length === 0}
                  selected={selectedRolesForEnvironment.map((role) => role.role)}
                  setSelected={(selected) => {
                    onSelect(selected, selectedRolesForEnvironment);
                  }}
                  placeholderText={
                    allRoles.length === 0
                      ? words("userManagement.noRoles")
                      : words("userManagement.rolesPlaceholder")
                  }
                  options={allRoles.map((option: string) => {
                    return {
                      value: option,
                      children: option,
                      isSelected: selectedRolesForEnvironment
                        .map((role) => role.role)
                        .includes(option),
                    };
                  })}
                />
              </FlexItem>
              <FlexItem>
                {(removeRole.isPending || addRole.isPending) && (
                  <Spinner size="sm" aria-label="spinner-role-management" />
                )}
              </FlexItem>
            </Flex>
          </FlexItem>
          <FlexItem>
            <Flex>
              {selectedRolesForEnvironment.length > 0 ? (
                selectedRolesForEnvironment.map((role) => {
                  return (
                    <FlexItem
                      key={`container-chip-${role.role}-${environment.id}`}
                      aria-label={`container-chip-${role.role}`}
                    >
                      <Label
                        variant="outline"
                        color="blue"
                        key={`chip-${role.role}-${environment.id}`}
                        aria-label={`chip-role-${role.role}-${environment.id}`}
                        closeBtnAriaLabel={`remove-role-${role.role}-${environment.id}`}
                        onClose={() =>
                          removeRole.mutate({ role: role.role, environment: environment.id })
                        }
                      >
                        {role.role}
                      </Label>
                    </FlexItem>
                  );
                })
              ) : (
                <FlexItem key={`container-chip-no-roles`} aria-label={`container-chip-no-roles`}>
                  <Label
                    variant="outline"
                    color="blue"
                    key={`chip-no-roles`}
                    aria-label={`chip-role-no-roles`}
                  >
                    {words("userManagement.noRolesAssigned")}
                  </Label>
                </FlexItem>
              )}
            </Flex>
          </FlexItem>
        </Flex>
      </Td>
    </Tr>
  );
};
