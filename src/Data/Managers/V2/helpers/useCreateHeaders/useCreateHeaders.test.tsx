import React from "react";
const mockedKeycloak = jest.fn();
import { renderHook } from "@testing-library/react";
import { AuthConfig, LocalConfig, PrimaryAuthController } from "@/Data/Auth";
import { createCookie, removeCookie } from "@/Data/Common/CookieHelper";
import { dependencies } from "@/Test";
import { DependencyProvider } from "@/UI";
import { useCreateHeaders } from ".";
jest.mock("keycloak-js", () => {
  return jest.fn().mockImplementation(mockedKeycloak);
});

const setup = (
  shouldUseAuth: string | undefined,
  externalConfig: AuthConfig | LocalConfig | undefined,
  keycloakUrl: string | undefined,
) => {
  const authController = new PrimaryAuthController(
    shouldUseAuth,
    externalConfig,
    keycloakUrl,
  );
  const wrapper = ({ children }) => (
    <DependencyProvider dependencies={{ ...dependencies, authController }}>
      {children}
    </DependencyProvider>
  );
  return wrapper;
};

describe("useCreateHeaders", () => {
  it("should return headers with environment when env is defined", () => {
    const env = "1234abcd";
    const wrapper = setup(undefined, undefined, undefined);

    const { result } = renderHook(() => useCreateHeaders(env), { wrapper });
    expect(result.current.get("X-Inmanta-Tid")).toEqual(env);
  });

  it("should return headers without environment when env is undefined", () => {
    const wrapper = setup(undefined, undefined, undefined);

    const { result } = renderHook(() => useCreateHeaders(), { wrapper });
    expect(result.current.get("X-Inmanta-Tid")).toEqual(null);
  });

  it("should return headers without Authorization Token when authController is disabled", () => {
    const wrapper = setup(undefined, undefined, undefined);

    const { result } = renderHook(() => useCreateHeaders(), { wrapper });
    expect(result.current.get("Authorization")).toEqual(null);
  });

  it("should return headers without Authorization Token when local authController is enabled but there is no localAuth token set", () => {
    const wrapper = setup("true", { method: "database" }, undefined);

    const { result } = renderHook(() => useCreateHeaders(), { wrapper });
    expect(result.current.get("Authorization")).toEqual(null);
  });

  it("should return headers with Authorization Token when localAuth is enabled and localAuth token is set", () => {
    const wrapper = setup("true", { method: "database" }, undefined);
    createCookie("inmanta_user", "token", 1);
    const { result } = renderHook(() => useCreateHeaders(), { wrapper });

    expect(result.current.get("Authorization")).toEqual("Bearer token");
    removeCookie("inmanta_user");
  });

  it("should return headers without Authorization Token when keycloakAuth is enabled and localAuth token is not set", () => {
    const wrapper = setup(
      "true",
      { method: "oidc", realm: "realm", clientId: "id" },
      undefined,
    );
    const { result } = renderHook(() => useCreateHeaders(), { wrapper });

    expect(result.current.get("Authorization")).toEqual(null);
  });

  it("should return headers without Authorization Token when keycloakAuth is enabled and localAuth token is not set", () => {
    mockedKeycloak.mockReturnValue({ token: "keycloak-token" });

    const wrapper = setup(
      "true",
      { method: "oidc", realm: "realm", clientId: "id" },
      undefined,
    );
    const { result } = renderHook(() => useCreateHeaders(), { wrapper });
    expect(result.current.get("Authorization")).toEqual(
      "Bearer keycloak-token",
    );
  });
});
