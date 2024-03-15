import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { screen } from "@testing-library/dom";
import { act, render, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { PrimaryAuthController } from "@/Data";
import { dependencies } from "@/Test";
import { DependencyProvider } from "@/UI";
import { LoginPage } from ".";
const mockedUsedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedUsedNavigate,
}));

const setup = () => {
  const queryClient = new QueryClient();
  const authController = new PrimaryAuthController(
    "true",
    { method: "database" },
    undefined,
  );
  return (
    <QueryClientProvider client={queryClient}>
      <DependencyProvider dependencies={{ ...dependencies, authController }}>
        <LoginPage />
      </DependencyProvider>
    </QueryClientProvider>
  );
};

describe("loginPage", () => {
  it("", async () => {
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

    const component = setup();

    server.listen();
    render(component);
    const usernameInput = screen.getByLabelText("input-username");
    await act(async () => {
      await userEvent.type(usernameInput, "test_user");
    });
    const passwordInput = screen.getByLabelText("input-password");
    await act(async () => {
      await userEvent.type(passwordInput, "test_password");
    });

    const showPasswordButton = screen.getByLabelText("show-password");
    await act(async () => {
      await userEvent.click(showPasswordButton);
    });

    const passwordInput1 = screen.getByLabelText("input-password");
    expect(passwordInput1).toHaveAttribute("type", "text");

    const hidePasswordButton = screen.getByLabelText("hide-password");
    await act(async () => {
      await userEvent.click(hidePasswordButton);
    });

    const passwordInput2 = screen.getByLabelText("input-password");
    expect(passwordInput2).toHaveAttribute("type", "password");

    const logInButton = screen.getByLabelText("login-button");
    await act(async () => {
      await userEvent.click(logInButton);
    });

    await waitFor(() => expect(mockedUsedNavigate).toHaveBeenCalledWith(0));
    server.close();
  });

  it("", async () => {
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

    const component = setup();
    server.listen();
    render(component);

    const usernameInput = screen.getByLabelText("input-username");
    await act(async () => {
      await userEvent.type(usernameInput, "test_user");
    });
    const passwordInput = screen.getByLabelText("input-password");
    await act(async () => {
      await userEvent.type(passwordInput, "test_password");
    });

    const logInButton = screen.getByLabelText("login-button");
    await act(async () => {
      await userEvent.click(logInButton);
    });

    await waitFor(() => {
      expect(screen.getByLabelText("error-message")).toHaveTextContent(
        "Access to this resource is unauthorized",
      );
    });

    server.close();
  });
});
