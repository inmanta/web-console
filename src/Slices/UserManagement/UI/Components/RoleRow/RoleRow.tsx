import React, { useContext } from "react";
import { AlertVariant, Flex, FlexItem, Label, Skeleton, Spinner } from "@patternfly/react-core";
import { Td, Tr } from "@patternfly/react-table";
import { useQueryClient, UseQueryResult } from "@tanstack/react-query";
import {
  EnvironmentPreview,
  getUserRoleKey,
  useAddRoleToUser,
  useRemoveRoleFromUser,
  UserRoleInfo,
} from "@/Data/Queries";
import { words } from "@/UI";
import { ErrorView, MultiTextSelect } from "@/UI/Components";
import { ModalContext } from "@/UI/Root/Components/ModalProvider";

interface Props {
  username: string;
  environment: EnvironmentPreview;
  roles: UseQueryResult<UserRoleInfo[], Error>;
  allRoles: string[];
  setAlert: (title: string, variant: AlertVariant, message: string) => void;
}

/**
 * A functional component that renders a row in the user information table.
 * @props {Props} props - The props of the component.
 * @prop {string} username - The username of the user to remove the role from.
 * @prop {EnvironmentPreview} environment - The environment of the user within we want to add or remove the role.
 * @prop {UseQueryResult<UserRoleInfo[], Error>} roles - The roles of the user.
 * @prop {string[]} allRoles - The all roles of the user.
 * @prop {setAlert} setAlert - The function to set the alert.
 */
export const RoleRow = ({ username, environment, roles, allRoles, setAlert }: Props) => {
  const { closeModal } = useContext(ModalContext);
  const client = useQueryClient();

  const removeRole = useRemoveRoleFromUser({
    user: username,
    options: {
      onSuccess: () => {
        closeModal();
        client.invalidateQueries({ queryKey: getUserRoleKey.single(username) });
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
        client.invalidateQueries({ queryKey: getUserRoleKey.single(username) });
      },
      onError: (error) => {
        setAlert(words("error"), AlertVariant.danger, error.message);
      },
    },
  });

  /**
   * Handles the selection of roles.
   * @param {string | ((prevState: string[]) => string[])} selected - The selected role.
   * @param {UserRoleInfo[]} selectedRoles - The already selected roles.
   */
  const onSelect = (
    selected: string | ((prevState: string[]) => string[]),
    selectedRoles: UserRoleInfo[]
  ) => {
    if (typeof selected === "string") {
      if (selectedRoles.some((role) => role.name === selected)) {
        removeRole.mutate({ role: selected, environment: environment.id });
      } else {
        addRole.mutate({ role: selected, environment: environment.id });
      }
    }
  };

  if (roles.isError) {
    return (
      <Tr key={`Row-${environment.name}`}>
        <Td colSpan={2}>
          <ErrorView
            message={words("error.general")(roles.error.message)}
            aria-label="Environments-Error"
            retry={roles.refetch}
          />
        </Td>
      </Tr>
    );
  }

  if (roles.isSuccess) {
    const selectedRolesForEnvironment = roles.data.filter(
      (role) => role.environment === environment.id
    );

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
                    selected={selectedRolesForEnvironment.map((role) => role.name)}
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
                          .map((role) => role.name)
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
                {selectedRolesForEnvironment.length > 0
                  ? selectedRolesForEnvironment
                      .map((role) => role.name)
                      .map((name) => {
                        return (
                          <FlexItem key={`container-chip-${name}-${environment.id}`}>
                            <Label
                              variant="outline"
                              color="blue"
                              key={`chip-${name}-${environment.id}`}
                              aria-label={`chip-role-${name}-${environment.id}`}
                              closeBtnAriaLabel={`remove-role-${name}-${environment.id}`}
                              onClose={() =>
                                removeRole.mutate({ role: name, environment: environment.id })
                              }
                            >
                              {name}
                            </Label>
                          </FlexItem>
                        );
                      })
                  : words("userManagement.noRolesAssigned")}
              </Flex>
            </FlexItem>
          </Flex>
        </Td>
      </Tr>
    );
  }

  return (
    <Tr key={`Row-${environment.name}`} data-testid={`roles-skeleton-row-${environment.name}`}>
      <Td colSpan={2}>
        <Skeleton />
      </Td>
    </Tr>
  );
};
