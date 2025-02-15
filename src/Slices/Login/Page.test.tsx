import React, { act } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { screen } from "@testing-library/dom";
import { render, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { KeycloakAuthConfig, LocalConfig } from "@/Data/Auth";
import { AuthProvider } from "@/Data/Auth/AuthProvider";
import * as CookieHelper from "@/Data/Common/CookieHelper";
import { dependencies } from "@/Test";
import { AuthTestWrapper } from "@/Test/Inject";
import { Login } from "./Page";

expect.extend(toHaveNoViolations);

const mockedUsedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedUsedNavigate,
}));

const setup = (config: KeycloakAuthConfig | LocalConfig | undefined) => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider config={config}>
        <AuthTestWrapper dependencies={dependencies}>
          <Login />
        </AuthTestWrapper>
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe("Login", () => {
  it("login form is properly rendered", async () => {
    render(setup({ method: "database" }));

    expect(screen.getByLabelText("input-username")).toBeInTheDocument();
    expect(screen.getByLabelText("input-password")).toBeInTheDocument();
    expect(screen.getByLabelText("login-button")).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  it("if user login with valid credentials we should set the cookie and reload the page", async () => {
    const spiedCreateCookie = jest.spyOn(CookieHelper, "createCookie");

    const server = setupServer(
      http.post("/api/v2/login", async ({ request }) => {
        const reqBody = await request.json();

        expect(reqBody).toEqual({
          username: "test_user",
          password: "test_password",
        });

        return HttpResponse.json({
          data: {
            token: "test-token",
            user: {
              username: "test_user",
              auth_method: "database",
            },
          },
        });
      }),
    );

    const component = setup({ method: "database" });

    server.listen();
    render(component);

    const usernameInput = screen.getByLabelText("input-username");

    await userEvent.type(usernameInput, "test_user");

    const passwordInput = screen.getByLabelText("input-password");

    await userEvent.type(passwordInput, "test_password");

    const showPasswordButton = screen.getByLabelText("show-password");

    await userEvent.click(showPasswordButton);

    const passwordInput1 = screen.getByLabelText("input-password");

    expect(passwordInput1).toHaveAttribute("type", "text");

    const hidePasswordButton = screen.getByLabelText("hide-password");

    await userEvent.click(hidePasswordButton);

    const passwordInput2 = screen.getByLabelText("input-password");

    expect(passwordInput2).toHaveAttribute("type", "password");

    const logInButton = screen.getByLabelText("login-button");

    await userEvent.click(logInButton);

    await waitFor(() =>
      expect(spiedCreateCookie).toHaveBeenCalledWith(
        "inmanta_user",
        "test-token",
        1,
      ),
    );

    await waitFor(() => expect(mockedUsedNavigate).toHaveBeenCalledWith("/"));

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });

    server.close();
  });

  it("If the user try to login with invalid credentials it should show error message", async () => {
    const server = setupServer(
      http.post("/api/v2/login", async ({ request }) => {
        const reqBody = await request.json();

        expect(reqBody).toEqual({
          username: "test_user",
          password: "test_password",
        });

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

    const component = setup({ method: "database" });

    server.listen();
    render(component);

    const usernameInput = screen.getByLabelText("input-username");

    await userEvent.type(usernameInput, "test_user");

    const passwordInput = screen.getByLabelText("input-password");

    await userEvent.type(passwordInput, "test_password");

    const logInButton = screen.getByLabelText("login-button");

    await userEvent.click(logInButton);

    await waitFor(() => {
      expect(screen.getByLabelText("error-message")).toHaveTextContent(
        "Access to this resource is unauthorized",
      );
    });

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });

    server.close();
  });

  it("If the user try to login with empty credentials it should show error message", async () => {
    const server = setupServer(
      http.post("/api/v2/login", async ({ request }) => {
        const reqBody = await request.json();

        expect(reqBody).toEqual({
          username: "",
          password: "",
        });

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

    const component = setup({ method: "database" });

    render(component);

    const logInButton = screen.getByLabelText("login-button");

    await userEvent.click(logInButton);

    await waitFor(() => {
      expect(screen.getByLabelText("error-message")).toHaveTextContent(
        "Access to this resource is unauthorized",
      );
    });

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });

    server.close();
  });
});
