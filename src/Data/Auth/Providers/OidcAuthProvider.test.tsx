import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { OidcAuthProvider } from "./OidcAuthProvider";

const mocks = vi.hoisted(() => ({
  auth: {
    isLoading: false,
    isAuthenticated: false,
    error: undefined as undefined | { message: string },
    user: undefined as undefined | { profile?: Record<string, unknown>; access_token?: string },
    signinRedirect: vi.fn(),
    signoutRedirect: vi.fn(),
  },
  localToken: null as string | null,
}));

vi.mock("react-oidc-context", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: () => mocks.auth,
}));

vi.mock("./localToken", () => ({
  getLocalToken: () => mocks.localToken,
  getLocalUsername: () => null,
  setLocalToken: vi.fn(),
  clearLocalToken: vi.fn(),
}));

const config = {
  method: "oidc-generic" as const,
  authority: "https://idp.example.com",
  clientId: "test-client",
};

const renderProvider = (localFallback: boolean) =>
  render(
    <TestMemoryRouter>
      <OidcAuthProvider config={{ ...config, localFallback }}>
        <div>APP CONTENT</div>
      </OidcAuthProvider>
    </TestMemoryRouter>
  );

beforeEach(() => {
  mocks.auth.isLoading = false;
  mocks.auth.isAuthenticated = false;
  mocks.auth.error = undefined;
  mocks.auth.user = undefined;
  mocks.auth.signinRedirect.mockClear();
  mocks.localToken = null;
});

describe("OidcAuthProvider local login fallback", () => {
  it("redirects to the IdP first (no chooser) when the fallback is enabled and there is no error", () => {
    renderProvider(true);

    expect(mocks.auth.signinRedirect).toHaveBeenCalled();
    expect(screen.queryByLabelText("local-login-fallback")).not.toBeInTheDocument();
    expect(screen.queryByText("APP CONTENT")).not.toBeInTheDocument();
  });

  it("offers the local login fallback only after the IdP has errored", () => {
    mocks.auth.error = { message: "idp unreachable" };

    renderProvider(true);

    expect(screen.getByLabelText("local-login-fallback")).toBeInTheDocument();
    expect(mocks.auth.signinRedirect).not.toHaveBeenCalled();
  });

  it("redirects to the IdP and shows no fallback when the fallback is disabled", () => {
    renderProvider(false);

    expect(screen.queryByLabelText("local-login-fallback")).not.toBeInTheDocument();
    expect(screen.queryByText("APP CONTENT")).not.toBeInTheDocument();
    expect(mocks.auth.signinRedirect).toHaveBeenCalled();
  });

  it("shows the plain error and no fallback when the IdP errors and the fallback is disabled", () => {
    mocks.auth.error = { message: "idp unreachable" };

    renderProvider(false);

    expect(screen.queryByLabelText("local-login-fallback")).not.toBeInTheDocument();
    expect(mocks.auth.signinRedirect).not.toHaveBeenCalled();
  });

  it("renders the app when authenticated through the IdP", () => {
    mocks.auth.isAuthenticated = true;
    mocks.auth.user = { profile: { preferred_username: "alice" } };

    renderProvider(true);

    expect(screen.getByText("APP CONTENT")).toBeInTheDocument();
    expect(screen.queryByLabelText("local-login-fallback")).not.toBeInTheDocument();
  });

  it("renders the app on a local fallback session even without IdP authentication", () => {
    mocks.localToken = "a-local-token";

    renderProvider(true);

    expect(screen.getByText("APP CONTENT")).toBeInTheDocument();
  });
});
