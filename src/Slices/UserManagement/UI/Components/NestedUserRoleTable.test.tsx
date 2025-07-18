import React from "react";
import { Page } from "@patternfly/react-core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { UserInfo } from "@/Data/Queries";
import { NestedUserRoleTable } from "./NestedUserRoleTable";

const mockEnvironments = [
  { id: "env1", name: "Production" },
  { id: "env2", name: "Staging" },
];
const mockRoles = ["admin", "observer", "deployer"];

const mockUser: UserInfo = {
  username: "alice",
  auth_method: "database",
  is_admin: false,
  roles: {
    env1: ["admin"],
  },
};

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

// Test wrapper to simulate parent state update
function TestWrapper({ initialUser }: { initialUser: UserInfo }) {
  const [user, setUser] = React.useState(initialUser);
  return (
    <Page>
      <QueryClientProvider client={new QueryClient()}>
        <NestedUserRoleTable {...user} />
        {/* Expose a way to update user state for the test */}
        <button
          data-testid="simulate-parent-update"
          onClick={() => {
            setUser((prev) => ({
              ...prev,
              roles: {
                ...prev.roles,
                env1: prev.roles.env1.includes("admin")
                  ? prev.roles.env1.filter((role) => role !== "admin")
                  : [...prev.roles.env1, "admin"],
              },
            }));
          }}
        />
      </QueryClientProvider>
    </Page>
  );
}

describe("NestedUserRoleTable (with MSW)", () => {
  let server: ReturnType<typeof setupServer>;

  afterEach(() => {
    if (server) server.close();
  });

  it("renders environments and roles", async () => {
    server = setupServer(
      http.get("/api/v2/environment", () => HttpResponse.json({ data: mockEnvironments })),
      http.get("/api/v2/role", () => HttpResponse.json({ data: mockRoles }))
    );
    server.listen();

    renderWithClient(<NestedUserRoleTable {...mockUser} />);

    expect(await screen.findByText("Production")).toBeInTheDocument();
    expect(screen.getByText("Staging")).toBeInTheDocument();
    expect(screen.getByText("admin")).toBeInTheDocument();
    expect(screen.getByText(/none/i)).toBeInTheDocument();
  });

  it("shows 'roles unavailable' if no roles and not loading", async () => {
    server = setupServer(
      http.get("/api/v2/environment", () => HttpResponse.json({ data: mockEnvironments })),
      http.get("/api/v2/role", () => HttpResponse.json({ data: undefined }))
    );
    server.listen();
    renderWithClient(<NestedUserRoleTable {...mockUser} />);
    expect(await screen.findByText(/no roles available/i)).toBeInTheDocument();
  });

  it("If a role is not yet assigned, it should be added", async () => {
    server = setupServer(
      http.get("/api/v2/environment", () => HttpResponse.json({ data: mockEnvironments })),
      http.get("/api/v2/role", () => HttpResponse.json({ data: mockRoles })),
      http.post("/api/v2/role_assignment/:username", async () => {
        return HttpResponse.json({}, { status: 204 });
      })
    );
    server.listen();
    render(<TestWrapper initialUser={{ ...mockUser, roles: { env1: [] } }} />);
    const editDropdowns = await screen.findAllByLabelText("role-selector");
    fireEvent.click(editDropdowns[0]);

    // Find the menuitem for 'admin' in the dropdown
    const menuItems = await screen.findAllByRole("menuitem");
    const adminMenuItem = menuItems.find((item) => item.textContent?.includes("admin"));
    expect(adminMenuItem).toBeDefined();

    // Find the checkbox inside the menuitem and click it
    const checkbox = within(adminMenuItem!).getByRole("checkbox");
    fireEvent.click(checkbox);

    // Simulate parent update after mutation
    fireEvent.click(screen.getByTestId("simulate-parent-update"));

    // there should now be a label with the role besides the dropdown
    expect(screen.getByTestId("role-label-admin")).toBeInTheDocument();
  });

  it("If a role is already assigned, it should be removed", async () => {
    server = setupServer(
      http.get("/api/v2/environment", () => HttpResponse.json({ data: mockEnvironments })),
      http.get("/api/v2/role", () => HttpResponse.json({ data: mockRoles })),
      http.delete("/api/v2/role_assignment/:username", () => {
        return HttpResponse.json({}, { status: 204 });
      })
    );
    server.listen();
    render(<TestWrapper initialUser={mockUser} />);
    const editButtons = await screen.findAllByLabelText("role-selector");
    fireEvent.click(editButtons[0]); // env1

    // Find the menuitem for 'admin' in the dropdown
    const menuItems = await screen.findAllByRole("menuitem");
    const adminMenuItem = menuItems.find((item) => item.textContent?.includes("admin"));
    expect(adminMenuItem).toBeDefined();

    // Find the checkbox inside the menuitem and click it
    const checkbox = within(adminMenuItem!).getByRole("checkbox");
    fireEvent.click(checkbox);

    // Simulate parent update after mutation
    fireEvent.click(screen.getByTestId("simulate-parent-update"));
    // Wait for the parent state to update and the label to disappear
    await waitFor(() => expect(screen.queryByTestId("role-label-admin")).not.toBeInTheDocument());
  });

  it("shows error alert if addRole fails", async () => {
    server = setupServer(
      http.get("/api/v2/environment", () => HttpResponse.json({ data: mockEnvironments })),
      http.get("/api/v2/role", () => HttpResponse.json({ data: mockRoles })),
      http.post("/api/v2/role_assignment/:username", async () => {
        return HttpResponse.json({ message: "Invalid request" }, { status: 400 });
      })
    );

    server.listen();
    renderWithClient(<TestWrapper initialUser={{ ...mockUser, roles: { env1: [] } }} />);
    const editDropdowns = await screen.findAllByLabelText("role-selector");
    fireEvent.click(editDropdowns[1]); // env2
    // Find the menuitem for 'admin' in the dropdown
    const adminMenuItem = await screen.findByRole("menuitem", { name: /admin/i });
    expect(adminMenuItem).toBeDefined();
    // Find the checkbox inside the menuitem and click it
    const checkbox = within(adminMenuItem).getByRole("checkbox");
    fireEvent.click(checkbox);

    const errorMessage = await screen.findByLabelText("error-message");

    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveTextContent("Invalid request");
  });

  it("shows error alert if deleteRole fails", async () => {
    server = setupServer(
      http.get("/api/v2/environment", () => HttpResponse.json({ data: mockEnvironments })),
      http.get("/api/v2/role", () => HttpResponse.json({ data: mockRoles })),
      http.delete("/api/v2/role_assignment/:username", () => {
        return HttpResponse.json({ message: "Delete failed" }, { status: 500 });
      })
    );
    server.listen();
    renderWithClient(<NestedUserRoleTable {...mockUser} />);
    const editDropdowns = await screen.findAllByLabelText("role-selector");
    fireEvent.click(editDropdowns[0]); // env1
    // Find the menuitem for 'admin' in the dropdown
    const menuItems = await screen.findAllByRole("menuitem");
    const adminMenuItem = menuItems.find((item) => item.textContent?.includes("admin"));
    expect(adminMenuItem).toBeDefined();

    // Find the checkbox inside the menuitem and click it
    const checkbox = within(adminMenuItem!).getByRole("checkbox");
    fireEvent.click(checkbox);

    await waitFor(() => expect(screen.getByText(/delete failed/i)).toBeInTheDocument());
  });

  it("renders multiple roles as labels", async () => {
    const multiRoleUser: UserInfo = {
      ...mockUser,
      roles: { env1: ["admin", "observer"], env2: [] },
    };
    server = setupServer(
      http.get("/api/v2/environment", () => HttpResponse.json({ data: mockEnvironments })),
      http.get("/api/v2/role", () => HttpResponse.json({ data: mockRoles }))
    );
    server.listen();
    renderWithClient(<NestedUserRoleTable {...multiRoleUser} />);
    expect(await screen.findByText("admin")).toBeInTheDocument();
    expect(screen.getByText("observer")).toBeInTheDocument();
  });

  it("renders no rows if no environments", async () => {
    server = setupServer(http.get("/api/v2/environment", () => HttpResponse.json({ data: [] })));
    server.listen();
    renderWithClient(<NestedUserRoleTable {...mockUser} />);
    expect(screen.queryByText("Production")).not.toBeInTheDocument();
    expect(screen.queryByText("Staging")).not.toBeInTheDocument();
  });
});
