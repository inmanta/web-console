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
import { words } from "@/UI";
import { Login } from "./Page";

expect.extend(toHaveNoViolations);

const mockedUsedNavigate = jest.fn();

jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
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
  it("login page is properly rendered with PatternFly components", async () => {
    render(setup({ method: "database" }));

    // Check for PatternFly LoginPage elements
    expect(screen.getByText(words("login.title"))).toBeInTheDocument();
    expect(screen.getByText(words("login.subtitle"))).toBeInTheDocument();

    // Check for form elements
    expect(screen.getByRole("textbox", { name: "Username" })).toBeInTheDocument();
    expect(document.getElementById("pf-login-password-id")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log in" })).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });
  });

  it("if user login with valid credentials we should set the cookie and navigate to home", async () => {
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
      })
    );

    const component = setup({ method: "database" });

    server.listen();
    render(component);

    const usernameInput = screen.getByRole("textbox", { name: "Username" });
    await userEvent.type(usernameInput, "test_user");

    const passwordInput = document.getElementById("pf-login-password-id") as HTMLInputElement;
    await userEvent.type(passwordInput, "test_password");

    const logInButton = screen.getByRole("button", { name: "Log in" });
    await userEvent.click(logInButton);

    await waitFor(() =>
      expect(spiedCreateCookie).toHaveBeenCalledWith("inmanta_user", "test-token", 1)
    );

    await waitFor(() => expect(mockedUsedNavigate).toHaveBeenCalledWith("/console"));

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
          }
        );
      })
    );

    const component = setup({ method: "database" });

    server.listen();
    render(component);

    const usernameInput = screen.getByRole("textbox", { name: "Username" });
    await userEvent.type(usernameInput, "test_user");

    const passwordInput = document.getElementById("pf-login-password-id") as HTMLInputElement;
    await userEvent.type(passwordInput, "test_password");

    const logInButton = screen.getByRole("button", { name: "Log in" });
    await userEvent.click(logInButton);

    await waitFor(() => {
      const helperText = screen.getByText("Access to this resource is unauthorized");
      expect(helperText).toBeInTheDocument();
      expect(helperText.closest(".pf-v6-c-helper-text__item-text")).toBeInTheDocument();
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
            message: "Username or password is incorrect",
          },
          {
            status: 401,
          }
        );
      })
    );

    server.listen();

    const component = setup({ method: "database" });

    render(component);

    const logInButton = screen.getByRole("button", { name: "Log in" });
    await userEvent.click(logInButton);

    await waitFor(() => {
      const helperText = screen.getByText("Username or password is incorrect");
      expect(helperText).toBeInTheDocument();
      expect(helperText.closest(".pf-v6-c-helper-text__item-text")).toBeInTheDocument();
    });

    await act(async () => {
      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });

    server.close();
  });
});
