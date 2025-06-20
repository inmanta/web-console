import React, { act } from "react";
import { Page } from "@patternfly/react-core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { HttpResponse, http } from "msw";
import { graphql } from "msw";
import { setupServer } from "msw/node";
import { EnvironmentPreviewResponse, UserInfo, UserRole } from "@/Data/Queries";
import { MockedDependencyProvider } from "@/Test";
import { words } from "@/UI";
import { ModalProvider } from "@/UI/Root/Components/ModalProvider";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { UserManagementPage } from "./Page";

expect.extend(toHaveNoViolations);

const setup = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const component = (
    <TestMemoryRouter>
      <QueryClientProvider client={queryClient}>
        <MockedDependencyProvider>
          <ModalProvider>
            <Page>
              <UserManagementPage />
            </Page>
          </ModalProvider>
        </MockedDependencyProvider>
      </QueryClientProvider>
    </TestMemoryRouter>
  );

  return component;
};

const mockedUsers = http.get("/api/v2/user", async () => {
  return HttpResponse.json({
    data: [
      { username: "test_user", auth_method: "database" },
      { username: "test_user2", auth_method: "oidc" },
    ],
  });
});

describe("UserManagementPage", () => {
  const roles = ["admin", "viewer"];
  const queryBase = graphql.link("/api/v2/graphql");

  const server = setupServer(
    http.get("/api/v2/role", async () => HttpResponse.json({ data: roles })),
    queryBase.operation(() => {
      return HttpResponse.json<{ data: EnvironmentPreviewResponse }>({
        data: {
          data: {
            environments: {
              edges: [
                {
                  node: {
                    id: "1",
                    name: "Environment 1",
                    isCompiling: false,
                    isExpertMode: false,
                    halted: false,
                  },
                },
              ],
            },
          },
          errors: [],
          extensions: {},
        },
      });
    }),
    http.get("/api/v2/role_assignment/test_user", async () => HttpResponse.json({ data: [] })),
    http.get("/api/v2/role_assignment/test_user2", async () => HttpResponse.json({ data: [] })),
    http.get("/api/v2/role_assignment/new_user", async () => HttpResponse.json({ data: [] }))
  );

  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it("should render empty view when no users are returned by API", async () => {
    server.use(
      http.get("/api/v2/user", async () => {
        return HttpResponse.json({
          data: [],
        });
      })
    );

    server.listen();
    const component = setup();

    render(component);

    const loadingView = await screen.findByLabelText("UserManagement-Loading");

    expect(loadingView).toBeInTheDocument();

    const emptyView = await screen.findByLabelText("UserManagement-Empty");

    expect(emptyView).toBeInTheDocument();

    const addUserButton = await screen.findByText(words("userManagement.addUser"));

    expect(addUserButton).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  it("should display user list when users are returned by API", async () => {
    server.use(
      mockedUsers,
      http.get("/api/v2/role_assignment/test_user", async () =>
        HttpResponse.json({ data: [{ role: "admin", environment: "1" }] })
      )
    );

    server.listen();
    const component = setup();

    render(component);

    const loadingView = await screen.findByLabelText("UserManagement-Loading");

    expect(loadingView).toBeInTheDocument();

    const successView = await screen.findByLabelText("users-table");

    expect(successView).toBeInTheDocument();

    const userRows = screen.getAllByTestId("user-row");

    expect(userRows).toHaveLength(2);

    expect(screen.getByText("test_user")).toBeInTheDocument();
    expect(screen.getByText("test_user2")).toBeInTheDocument();

    expect(screen.getAllByText("Delete")).toHaveLength(2);

    expect(await screen.findByLabelText("roles-success")).toBeInTheDocument();

    expect(await screen.findByText("admin")).toBeInTheDocument();
    expect(await screen.findByText("No roles assigned")).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  it("should display error view when environment API call fails", async () => {
    let counter = 0;
    server.use(
      mockedUsers,
      queryBase.operation(() => {
        if (counter > 0) {
          return HttpResponse.json<{ data: EnvironmentPreviewResponse }>({
            data: {
              data: {
                environments: {
                  edges: [
                    {
                      node: {
                        id: "1",
                        name: "Environment 1",
                        isCompiling: false,
                        isExpertMode: false,
                        halted: false,
                      },
                    },
                  ],
                },
              },
              errors: [],
              extensions: {},
            },
          });
        }
        counter++;
        return HttpResponse.json(
          {
            data: null,
            errors: [{ message: "Access to this resource is unauthorized" }],
          },
          {
            status: 401,
          }
        );
      })
    );

    server.listen();
    const component = setup();

    render(component);

    const loadingView = await screen.findByLabelText("UserManagement-Loading");

    expect(loadingView).toBeInTheDocument();

    const errorView = await screen.findByLabelText("UserManagement-Failed");

    expect(errorView).toBeInTheDocument();

    const errorMessage = await screen.findByText("Something went wrong");

    expect(errorMessage).toBeVisible();

    const retryButton = await screen.findByText("Retry");
    await userEvent.click(retryButton);

    const successView = await screen.findByLabelText("users-table");

    expect(successView).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  it("should display error view when roles API call fails", async () => {
    let counter = 0;

    server.use(
      mockedUsers,
      http.get("/api/v2/role", async () => {
        if (counter > 0) {
          return HttpResponse.json({
            data: ["test"],
          });
        }
        counter++;
        return HttpResponse.json(
          {
            message: "Access to this resource is unauthorized",
          },
          {
            status: 401,
          }
        );
      })
    );

    server.listen();
    const component = setup();

    render(component);

    const loadingView = await screen.findByLabelText("UserManagement-Loading");

    expect(loadingView).toBeInTheDocument();

    const errorView = await screen.findByLabelText("UserManagement-Failed");

    expect(errorView).toBeInTheDocument();

    const errorMessage = await screen.findByText("Something went wrong");

    expect(errorMessage).toBeVisible();

    const retryButton = await screen.findByText("Retry");
    await userEvent.click(retryButton);

    const successView = await screen.findByLabelText("users-table");

    expect(successView).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  it("should display error view when users API call fails", async () => {
    let counter = 0;
    server.use(
      http.get("/api/v2/user", async () => {
        if (counter > 0) {
          return HttpResponse.json({
            data: [{ username: "test_user", auth_method: "database" }],
          });
        }
        counter++;

        return HttpResponse.json(
          {
            message: "Access to this resource is unauthorized",
          },
          {
            status: 401,
          }
        );
      })
    );

    server.listen();
    const component = setup();

    render(component);

    const loadingView = await screen.findByLabelText("UserManagement-Loading");

    expect(loadingView).toBeInTheDocument();

    const errorView = await screen.findByLabelText("UserManagement-Failed");

    expect(errorView).toBeInTheDocument();

    const errorMessage = await screen.findByText(
      "The following error occured: Access to this resource is unauthorized"
    );

    expect(errorMessage).toBeVisible();

    //assert that correct retry function is called
    const retryButton = await screen.findByText("Retry");
    await userEvent.click(retryButton);

    const successView = await screen.findByLabelText("users-table");

    expect(successView).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  it("should display error alert view when users roles API call fails", async () => {
    let counter = 0;
    server.use(
      mockedUsers,
      http.get("/api/v2/role_assignment/test_user", async () => {
        if (counter > 0) {
          return HttpResponse.json({
            data: [{ role: "admin", environment: "1" }],
          });
        }
        counter++;

        return HttpResponse.json(
          {
            message: "Access to this resource is unauthorized",
          },
          {
            status: 401,
          }
        );
      })
    );

    server.listen();
    const component = setup();

    render(component);

    const successView = await screen.findByLabelText("users-table");

    expect(successView).toBeInTheDocument();

    const userRows = screen.getAllByTestId("user-row");

    expect(userRows).toHaveLength(2);

    const toast = await screen.findByTestId("ToastAlert");

    expect(toast).toBeInTheDocument();

    const errorMessage = await screen.findByText(
      "The following error occured: Access to this resource is unauthorized"
    );

    expect(errorMessage).toBeVisible();

    //assert that correct retry function is called
    const retryButton = await screen.findByText("Retry");
    await userEvent.click(retryButton);

    const role = await screen.findByText("admin");
    expect(role).toBeInTheDocument();

    expect(errorMessage).not.toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  it("should sent request to add user to the list", async () => {
    const data: UserInfo[] = [
      { username: "test_user", auth_method: "database" },
      { username: "test_user2", auth_method: "oidc" },
    ];

    server.use(
      http.get("/api/v2/user", async () => {
        return HttpResponse.json({
          data,
        });
      }),
      http.post("/api/v2/user", async ({ request }): Promise<HttpResponse> => {
        const reqBody = await request.json();

        if (typeof reqBody !== "object") {
          return HttpResponse.json(
            {
              message: "Invalid request: wrong request body format",
            },
            {
              status: 400,
            }
          );
        }

        if (reqBody?.password.length <= 8) {
          return HttpResponse.json(
            {
              message: "Invalid request: the password should be at least 8 characters long",
            },
            {
              status: 400,
            }
          );
        }

        data.push({ username: reqBody?.username, auth_method: "database" });

        return HttpResponse.json({
          username: "new_user",
          auth_method: "database",
        });
      }),
      http.delete("/api/v2/user/test_user", async (): Promise<HttpResponse> => {
        data.splice(0, 1);

        return HttpResponse.json({ status: 204 });
      })
    );

    server.listen();
    const component = setup();

    render(component);

    const loadingView = await screen.findByLabelText("UserManagement-Loading");

    expect(loadingView).toBeInTheDocument();

    const successView = await screen.findByLabelText("users-table");

    expect(successView).toBeInTheDocument();
    const userRows = screen.getAllByTestId("user-row");

    expect(userRows).toHaveLength(2);

    await userEvent.click(screen.getByText("Add User"));

    //mock error scenario
    await userEvent.type(screen.getByLabelText("input-username"), "new_user");

    await userEvent.type(screen.getByLabelText("input-password"), "123456");

    await userEvent.click(screen.getByLabelText("confirm-button"));

    const errorMessage = await screen.findByLabelText("error-message");

    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveTextContent(
      "Invalid request: the password should be at least 8 characters long"
    );

    //mock success scenario
    await userEvent.type(screen.getByLabelText("input-password"), "12345678");

    await userEvent.click(screen.getByLabelText("confirm-button"));

    const updatedRows = await screen.findAllByTestId("user-row");

    expect(updatedRows).toHaveLength(3);

    expect(screen.getByText("new_user")).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  it("should sent request to change user password", async () => {
    server.use(
      http.get("/api/v2/user", async () => {
        return HttpResponse.json({ data: [{ username: "test_user", auth_method: "database" }] });
      }),
      http.patch("/api/v2/user/test_user/password", async ({ request }) => {
        const reqBody = await request.json();

        if (typeof reqBody !== "object") {
          return HttpResponse.json(
            {
              message: "Invalid request: wrong request body format",
            },
            {
              status: 400,
            }
          );
        }

        if (reqBody?.password.length <= 8) {
          return HttpResponse.json(
            {
              message: "Invalid request: the password should be at least 8 characters long",
            },
            {
              status: 400,
            }
          );
        }

        return HttpResponse.json();
      })
    );

    server.listen();
    const component = setup();

    render(component);

    const successView = await screen.findByLabelText("users-table");

    expect(successView).toBeInTheDocument();

    await userEvent.click(screen.getByText("Change Password"));

    const newPasswordInput = await screen.findByLabelText("new-password-input");

    await userEvent.type(newPasswordInput, "123");

    await userEvent.click(screen.getByTestId("change-password-button"));

    const errorMessage = await screen.findByLabelText("error-message");

    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveTextContent(
      "Invalid request: the password should be at least 8 characters long"
    );

    await userEvent.type(newPasswordInput, "12345678");

    await userEvent.click(screen.getByTestId("change-password-button"));

    expect(await screen.findByText("Password changed successfully")).toBeInTheDocument();
  });

  it("should sent request to remove user from the list", async () => {
    const data: UserInfo[] = [
      { username: "test_user", auth_method: "database" },
      { username: "test_user2", auth_method: "oidc" },
    ];

    server.use(
      http.get("/api/v2/user", async (): Promise<HttpResponse> => {
        return HttpResponse.json({
          data,
        });
      }),
      http.delete("/api/v2/user/test_user", async (): Promise<HttpResponse> => {
        data.splice(0, 1);

        return HttpResponse.json({ status: 204 });
      })
    );

    server.listen();
    const component = setup();

    render(component);

    const loadingView = await screen.findByLabelText("UserManagement-Loading");

    expect(loadingView).toBeInTheDocument();

    const successView = await screen.findByLabelText("users-table");

    expect(successView).toBeInTheDocument();

    const userRows = screen.getAllByTestId("user-row");

    expect(userRows).toHaveLength(2);

    await userEvent.click(screen.getAllByText("Delete")[0]);

    await userEvent.click(screen.getByText("Yes"));

    const updatedRows = await screen.findAllByTestId("user-row");

    expect(updatedRows).toHaveLength(1);

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  it("should handle successful addition of a role to a user", async () => {
    const userData = [{ username: "test_user", auth_method: "database" }];
    const userRoles: UserRole[] = [];

    server.use(
      http.get("/api/v2/user", async () => HttpResponse.json({ data: userData })),
      http.get("/api/v2/role_assignment/test_user", async () =>
        HttpResponse.json({ data: userRoles })
      ),
      // Success for add role
      http.post("/api/v2/role_assignment/test_user", async ({ request }) => {
        const body = await request.json();

        if (
          typeof body === "object" &&
          body !== null &&
          "role" in body &&
          body.role === "admin" &&
          body.environment === "1"
        ) {
          userRoles.push({ role: "admin", environment: "1" });
          return HttpResponse.json({});
        }
        // Simulate failure for other roles or malformed body
        return HttpResponse.json({ message: "Failed to add role" }, { status: 400 });
      })
    );

    server.listen();
    const component = setup();
    render(component);
    // Wait for user row
    await screen.findByText("test_user");
    // Expand user row
    await userEvent.click(screen.getAllByLabelText("Toggle-user-row")[0]);
    // Wait for role table
    await screen.findByText("Environment 1");
    // Add role (success)
    const select = screen.getByLabelText("toggle-roles-Environment 1");
    await userEvent.click(select);
    await userEvent.click(screen.getByRole("option", { name: "admin" }));
    // Role label should appear
    expect(await screen.findByLabelText("chip-role-admin-1")).toBeInTheDocument();

    // Error toast should not appear
    expect(screen.queryByText("Failed to add role")).toBeNull();
  });

  it("should handle failed addition of a role to a user", async () => {
    const userData = [{ username: "test_user", auth_method: "database" }];
    const userRoles: UserRole[] = [];

    server.use(
      http.get("/api/v2/user", async () => HttpResponse.json({ data: userData })),
      http.get("/api/v2/role_assignment/test_user", async () =>
        HttpResponse.json({ data: userRoles })
      ),
      // Success for add role
      http.post("/api/v2/role_assignment/test_user", async () => {
        // Simulate failure for other roles or malformed body
        return HttpResponse.json({ message: "Failed to add role" }, { status: 400 });
      })
    );

    server.listen();
    const component = setup();
    render(component);
    // Wait for user row
    await screen.findByText("test_user");
    // Expand user row
    await userEvent.click(screen.getAllByLabelText("Toggle-user-row")[0]);
    // Wait for role table
    await screen.findByText("Environment 1");
    // Add role (failure)
    await userEvent.click(screen.getByLabelText("toggle-roles-Environment 1"));

    await userEvent.click(screen.getByRole("option", { name: "viewer" }));

    // Error toast should appear
    expect(await screen.findByTestId("ToastAlert")).toHaveTextContent("Failed to add role");

    expect(screen.queryByLabelText("chip-role-viewer-1")).toBeNull();
  });

  it("should handle successful removal of a role from a user", async () => {
    const userData = [{ username: "test_user", auth_method: "database" }];
    const roles = ["admin", "viewer"];
    let userRoles: UserRole[] = [
      { role: "admin", environment: "1" },
      { role: "viewer", environment: "1" },
    ];

    server.use(
      http.get("/api/v2/user", async () => HttpResponse.json({ data: userData })),
      http.get("/api/v2/role", async () => HttpResponse.json({ data: roles })),
      http.get("/api/v2/role_assignment/test_user", async () =>
        HttpResponse.json({ data: userRoles })
      ),
      // Success for remove role
      http.delete("/api/v2/role_assignment/test_user", async ({ request }) => {
        const url = new URL(request.url);
        const role = url.searchParams.get("role");
        if (role === "admin") {
          userRoles = userRoles.filter((role) => role.role !== "admin");
          return HttpResponse.json({});
        }

        // Simulate failure for other roles
        return HttpResponse.json({ message: "Failed to remove role" }, { status: 400 });
      })
    );
    server.listen();
    const component = setup();
    render(component);
    // Wait for user row
    await screen.findByText("test_user");
    // Expand user row through roles toggle column
    await userEvent.click(await screen.findByText("admin, viewer"));
    // Wait for role table
    await screen.findByText("Environment 1");

    // assert that roles are present
    expect(await screen.findByLabelText("chip-role-admin-1")).toBeInTheDocument();
    expect(await screen.findByLabelText("chip-role-viewer-1")).toBeInTheDocument();

    // Remove role (success)
    await userEvent.click(await screen.findByLabelText("remove-role-admin-1")); // Click close button
    // Role label should disappear
    expect(await screen.findByLabelText("chip-role-viewer-1")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByLabelText("chip-role-admin-1")).toBeNull();
    });
  });

  it("should handle failed removal of a role from a user", async () => {
    const userData = [{ username: "test_user", auth_method: "database" }];
    const roles = ["admin", "viewer"];
    const userRoles: UserRole[] = [
      { role: "admin", environment: "1" },
      { role: "viewer", environment: "1" },
    ];

    server.use(
      http.get("/api/v2/user", async () => HttpResponse.json({ data: userData })),
      http.get("/api/v2/role", async () => HttpResponse.json({ data: roles })),

      http.get("/api/v2/role_assignment/test_user", async () =>
        HttpResponse.json({ data: userRoles })
      ),
      // Failure for remove role
      http.delete("/api/v2/role_assignment/test_user", async () => {
        return HttpResponse.json({ message: "Failed to remove role" }, { status: 400 });
      })
    );
    server.listen();
    const component = setup();
    render(component);
    // Wait for user row
    await screen.findByText("test_user");
    // Expand user row
    await userEvent.click(screen.getAllByLabelText("Toggle-user-row")[0]);
    // Wait for role table
    await screen.findByText("Environment 1");

    // assert that roles are present
    expect(await screen.findByLabelText("chip-role-admin-1")).toBeInTheDocument();
    expect(await screen.findByLabelText("chip-role-viewer-1")).toBeInTheDocument();

    // Remove role (failure)
    await userEvent.click(await screen.findByLabelText("remove-role-admin-1")); // Click close button

    // Error toast should appear
    expect(await screen.findByTestId("ToastAlert")).toHaveTextContent("Failed to remove role");
    expect(await screen.findByLabelText("chip-role-admin-1")).toBeInTheDocument();
    expect(await screen.findByLabelText("chip-role-viewer-1")).toBeInTheDocument();
  });
});
