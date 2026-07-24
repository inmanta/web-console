import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { AuthContextInterface, defaultAuthContext } from "@/Data";
import { MockedDependencyProvider } from "@/Test";
import { ChangePasswordForm } from "./ChangePasswordForm";

function setup(user: string, authHelper: AuthContextInterface = defaultAuthContext) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return (
    <QueryClientProvider client={queryClient}>
      <MockedDependencyProvider authHelper={authHelper}>
        <ChangePasswordForm user={user} />
      </MockedDependencyProvider>
    </QueryClientProvider>
  );
}

describe("ChangePasswordForm", () => {
  const server = setupServer();

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test("GIVEN an admin changing another user's password THEN no current-password field is shown and none is sent", async () => {
    let sentBody: Record<string, unknown> | null = null;
    server.use(
      http.patch("/api/v2/user/other_user/password", async ({ request }) => {
        sentBody = (await request.json()) as Record<string, unknown>;

        return HttpResponse.json();
      })
    );

    // Default auth helper: getUser() returns null, so this is not a self-service change.
    render(setup("other_user"));

    expect(screen.queryByLabelText("current-password-input")).toBeNull();

    await userEvent.type(screen.getByLabelText("new-password-input"), "new_password_123");
    await userEvent.click(screen.getByTestId("change-password-button"));

    await waitFor(() => expect(sentBody).toEqual({ password: "new_password_123" }));
  });

  test("GIVEN a user changing their own password THEN the current password is required and sent", async () => {
    let sentBody: Record<string, unknown> | null = null;
    server.use(
      http.patch("/api/v2/user/self_user/password", async ({ request }) => {
        sentBody = (await request.json()) as Record<string, unknown>;

        return HttpResponse.json();
      })
    );

    const selfAuth: AuthContextInterface = { ...defaultAuthContext, getUser: () => "self_user" };
    render(setup("self_user", selfAuth));

    const currentPasswordInput = screen.getByLabelText("current-password-input");
    const newPasswordInput = screen.getByLabelText("new-password-input");
    const submit = screen.getByTestId("change-password-button");

    // The submit stays disabled until both the current and the new password are filled in.
    await userEvent.type(newPasswordInput, "new_password_123");
    expect(submit).toBeDisabled();
    await userEvent.type(currentPasswordInput, "old_password_123");
    expect(submit).toBeEnabled();

    await userEvent.click(submit);

    await waitFor(() =>
      expect(sentBody).toEqual({
        password: "new_password_123",
        current_password: "old_password_123",
      })
    );
  });
});
