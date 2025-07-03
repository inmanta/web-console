import React from "react";
import { Table, Tbody } from "@patternfly/react-table";
import { QueryClient, QueryClientProvider, UseMutationResult } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { UserRole, EnvironmentPreview } from "@/Data/Queries";
import { useAddRoleToUser, useRemoveRoleFromUser } from "@/Data/Queries";
import { MockedDependencyProvider } from "@/Test";
import { words } from "@/UI";
import { ModalProvider } from "@/UI/Root/Components/ModalProvider";
import { RolesRow } from "./RolesRow";

// Mock the hooks
jest.mock("@/Data/Queries", () => ({
  ...jest.requireActual("@/Data/Queries"),
  useAddRoleToUser: jest.fn(),
  useRemoveRoleFromUser: jest.fn(),
}));

const mockUseAddRoleToUser = jest.mocked(useAddRoleToUser);
const mockUseRemoveRoleFromUser = jest.mocked(useRemoveRoleFromUser);

const setup = (props = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  const mockSetAlert = jest.fn();
  const mockCloseModal = jest.fn();

  const defaultProps = {
    username: "test-user",
    environment: { id: "env1", name: "Test Environment" } as EnvironmentPreview,
    roles: [],
    allRoles: ["admin", "viewer", "editor"],
    setAlert: mockSetAlert,
  };

  const mergedProps = { ...defaultProps, ...props };

  const component = (
    <QueryClientProvider client={queryClient}>
      <MockedDependencyProvider>
        <ModalProvider>
          <Table>
            <Tbody>
              <RolesRow {...mergedProps} />
            </Tbody>
          </Table>
        </ModalProvider>
      </MockedDependencyProvider>
    </QueryClientProvider>
  );

  return {
    component,
    mockSetAlert,
    mockCloseModal,
    defaultProps,
    mergedProps,
    queryClient,
  };
};

const defaultAddRoleMock = {
  mutate: jest.fn(),
  isPending: false,
} as unknown as UseMutationResult<void, Error, UserRole, unknown>; // workaround not to pass all irrelevant props to the component for given scenario, same for other tests

const defaultRemoveRoleMock = {
  mutate: jest.fn(),
  isPending: false,
} as unknown as UseMutationResult<void, Error, UserRole, unknown>;

describe("RolesRow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAddRoleToUser.mockReturnValue(defaultAddRoleMock);
    mockUseRemoveRoleFromUser.mockReturnValue(defaultRemoveRoleMock);
  });

  describe("Success State", () => {
    it("should render environment name and role management UI when roles load successfully", () => {
      const { component } = setup({
        roles: [
          { role: "admin", environment: "env1" },
          { role: "viewer", environment: "env2" },
        ],
      });

      render(component);

      expect(screen.getByText("Test Environment")).toBeInTheDocument();
      expect(screen.getByText("admin")).toBeInTheDocument();
      // viewer role should not be shown as it's for a different environment
      expect(screen.queryByText("viewer")).not.toBeInTheDocument();
    });

    it("should show correct placeholder text when roles are available", () => {
      const { component } = setup({
        roles: [{ role: "admin", environment: "env1" }],
      });

      render(component);

      const select = screen.getByLabelText("toggle-roles-Test Environment");
      expect(select).toHaveTextContent(words("userManagement.rolesPlaceholder"));
    });

    it("should show no roles assigned when no roles are available", () => {
      const { component } = setup({
        roles: [],
      });

      render(component);

      expect(screen.getByText("No roles assigned")).toBeInTheDocument();
    });
  });

  describe("Role Addition", () => {
    it("should call addRole mutation when selecting a new role", async () => {
      const mockMutate = jest.fn();
      mockUseAddRoleToUser.mockReturnValue({
        ...defaultAddRoleMock,
        mutate: mockMutate,
      });

      const { component } = setup({
        roles: [],
      });

      render(component);

      const select = screen.getByRole("button");
      await userEvent.click(select);

      // Simulate selecting a role
      const roleOption = screen.getByRole("option", { name: "admin" });
      await userEvent.click(roleOption);

      expect(mockMutate).toHaveBeenCalledWith({
        role: "admin",
        environment: "env1",
      });
    });

    it("should show spinner when adding role is pending", () => {
      mockUseAddRoleToUser.mockReturnValue({
        ...defaultAddRoleMock,
        isPending: true,
      } as unknown as UseMutationResult<void, Error, UserRole, unknown>);

      const { component } = setup({
        roles: [],
      });

      render(component);

      expect(screen.getByLabelText("spinner-role-management")).toBeInTheDocument();
    });

    it("should disable MultiTextSelect when adding role is pending", () => {
      mockUseAddRoleToUser.mockReturnValue({
        ...defaultAddRoleMock,
        isPending: true,
      } as unknown as UseMutationResult<void, Error, UserRole, unknown>);

      const { component } = setup({
        roles: [],
      });

      render(component);

      const select = screen.getByLabelText("toggle-roles-Test Environment");
      expect(select).toBeDisabled();
    });
  });

  describe("Role Removal", () => {
    it("should call removeRole mutation when clicking on selected role in the select list", async () => {
      const mockMutate = jest.fn();

      mockUseRemoveRoleFromUser.mockReturnValue({
        ...defaultRemoveRoleMock,
        mutate: mockMutate,
      });

      const { component } = setup({
        roles: [{ role: "admin", environment: "env1" }],
      });

      render(component);

      const select = screen.getByLabelText("toggle-roles-Test Environment");
      await userEvent.click(select);

      const roleOption = screen.getByRole("option", { name: "admin" });

      await userEvent.click(roleOption);

      expect(mockMutate).toHaveBeenCalledWith({
        role: "admin",
        environment: "env1",
      });
    });
    it("should call removeRole mutation when clicking close button on role label", async () => {
      const mockMutate = jest.fn();
      mockUseRemoveRoleFromUser.mockReturnValue({
        ...defaultRemoveRoleMock,
        mutate: mockMutate,
      });

      const { component } = setup({
        roles: [{ role: "admin", environment: "env1" }],
      });

      render(component);

      const adminLabelCloseButton = screen.getByLabelText("remove-role-admin-env1");
      expect(adminLabelCloseButton).toBeInTheDocument();

      await userEvent.click(adminLabelCloseButton);

      expect(mockMutate).toHaveBeenCalledWith({
        role: "admin",
        environment: "env1",
      });
    });

    it("should show spinner when removing role is pending", () => {
      mockUseRemoveRoleFromUser.mockReturnValue({
        ...defaultRemoveRoleMock,
        isPending: true,
      } as unknown as UseMutationResult<void, Error, UserRole, unknown>);

      const { component } = setup({
        roles: [{ role: "admin", environment: "env1" }],
      });

      render(component);

      expect(screen.getByLabelText("spinner-role-management")).toBeInTheDocument();
    });

    it("should disable MultiTextSelect when removing role is pending", () => {
      mockUseRemoveRoleFromUser.mockReturnValue({
        ...defaultRemoveRoleMock,
        isPending: true,
      } as unknown as UseMutationResult<void, Error, UserRole, unknown>);

      const { component } = setup({
        roles: [{ role: "admin", environment: "env1" }],
      });

      render(component);

      const select = screen.getByLabelText("toggle-roles-Test Environment");
      expect(select).toBeDisabled();
    });
  });

  describe("Environment Filtering", () => {
    it("should only show roles for the specific environment", () => {
      const { component } = setup({
        roles: [
          { role: "admin", environment: "env1" },
          { role: "viewer", environment: "env2" },
          { role: "editor", environment: "env1" },
        ],
      });

      render(component);

      // Should show roles for env1 only
      expect(screen.getByText("admin")).toBeInTheDocument();
      expect(screen.getByText("editor")).toBeInTheDocument();
      expect(screen.queryByText("viewer")).not.toBeInTheDocument();
    });
  });

  describe("MultiTextSelect Integration", () => {
    it("should pass correct options to MultiTextSelect", async () => {
      const { component } = setup({
        allRoles: ["admin", "viewer", "editor"],
        roles: [{ role: "admin", environment: "env1" }],
      });

      render(component);

      const select = screen.getByLabelText("toggle-roles-Test Environment");
      await userEvent.click(select);

      // Should show all available roles
      expect(screen.getByRole("option", { name: "admin" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "viewer" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "editor" })).toBeInTheDocument();
    });

    it("should mark selected roles as selected in options", async () => {
      const { component } = setup({
        allRoles: ["admin", "viewer", "editor"],
        roles: [{ role: "admin", environment: "env1" }],
      });

      render(component);

      const select = screen.getByLabelText("toggle-roles-Test Environment");
      await userEvent.click(select);

      // admin should be marked as selected
      const adminOption = screen.getByRole("option", { name: "admin" });
      expect(adminOption).toHaveAttribute("aria-selected", "true");
    });
  });

  describe("Disabled States", () => {
    it("should disable MultiTextSelect when no roles are available", () => {
      const { component } = setup({
        allRoles: [],
        roles: [],
      });

      render(component);

      const select = screen.getByLabelText("toggle-roles-Test Environment");
      expect(select).toBeDisabled();
      expect(select).toHaveTextContent(words("userManagement.noRoles"));
    });

    it("should disable MultiTextSelect when both add and remove are pending", () => {
      mockUseAddRoleToUser.mockReturnValue({
        ...defaultAddRoleMock,
        isPending: true,
      } as unknown as UseMutationResult<void, Error, UserRole, unknown>);
      mockUseRemoveRoleFromUser.mockReturnValue({
        ...defaultRemoveRoleMock,
        isPending: true,
      } as unknown as UseMutationResult<void, Error, UserRole, unknown>);

      const { component } = setup({
        roles: [{ role: "admin", environment: "env1" }],
      });

      render(component);

      const select = screen.getByLabelText("toggle-roles-Test Environment");
      expect(select).toBeDisabled();
    });
  });
});
