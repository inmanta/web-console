import React, { act } from "react";
import { MemoryRouter } from "react-router-dom";
import { Page } from "@patternfly/react-core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { UserInfo } from "@/Data/Managers/V2/Auth";
import { dependencies } from "@/Test";
import { DependencyProvider, words } from "@/UI";
import { ModalProvider } from "@/UI/Root/Components/ModalProvider";
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
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <DependencyProvider dependencies={{ ...dependencies }}>
          <ModalProvider>
            <Page>
              <UserManagementPage />
            </Page>
          </ModalProvider>
        </DependencyProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );

  return component;
};

describe("UserManagementPage", () => {
  it("should render empty view when no users are returned by API", async () => {
    const server = setupServer(
      http.get("/api/v2/user", async () => {
        return HttpResponse.json({
          data: [],
        });
      }),
    );

    server.listen();
    const component = setup();

    render(component);

    const loadingView = await screen.findByLabelText("UserManagement-Loading");

    expect(loadingView).toBeInTheDocument();

    const emptyView = await screen.findByLabelText("UserManagement-Empty");

    expect(emptyView).toBeInTheDocument();

    const addUserButton = await screen.findByText(
      words("userManagement.addUser"),
    );

    expect(addUserButton).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });

    server.close();
  });

  it("should display user list when users are returned by API", async () => {
    const server = setupServer(
      http.get("/api/v2/user", async () => {
        return HttpResponse.json({
          data: [
            { username: "test_user", auth_method: "database" },
            { username: "test_user2", auth_method: "oidc" },
          ],
        });
      }),
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

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });

    server.close();
  });

  it("should display error view when API call fails", async () => {
    const server = setupServer(
      http.get("/api/v2/user", async () => {
        return HttpResponse.json(
          {
            message: "Access to this resource is unauthorized",
          },
          {
            status: 401,
          },
        );
      }),
    );

    server.listen();
    const component = setup();

    render(component);

    const loadingView = await screen.findByLabelText("UserManagement-Loading");

    expect(loadingView).toBeInTheDocument();

    const errorView = await screen.findByLabelText("UserManagement-Failed");

    expect(errorView).toBeInTheDocument();

    const errorMessage = await screen.findByText(
      "The following error occured: Access to this resource is unauthorized",
    );

    expect(errorMessage).toBeVisible();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });

    server.close();
  });

  it("should sent request to add user to the list", async () => {
    const data: UserInfo[] = [
      { username: "test_user", auth_method: "database" },
      { username: "test_user2", auth_method: "oidc" },
    ];
    const server = setupServer(
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
            },
          );
        }

        if (reqBody?.password.length <= 8) {
          return HttpResponse.json(
            {
              message:
                "Invalid request: the password should be at least 8 characters long",
            },
            {
              status: 400,
            },
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
      }),
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
      "Invalid request: the password should be at least 8 characters long",
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

    server.close();
  });

  it("should sent request to remove user from the list", async () => {
    const data: UserInfo[] = [
      { username: "test_user", auth_method: "database" },
      { username: "test_user2", auth_method: "oidc" },
    ];
    const server = setupServer(
      http.get("/api/v2/user", async (): Promise<HttpResponse> => {
        return HttpResponse.json({
          data,
        });
      }),
      http.delete("/api/v2/user/test_user", async (): Promise<HttpResponse> => {
        data.splice(0, 1);

        return HttpResponse.json({ status: 204 });
      }),
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

    server.close();
  });
});
