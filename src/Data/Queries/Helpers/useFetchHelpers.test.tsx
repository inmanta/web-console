import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import { defaultAuthContext } from "@/Data/Auth/AuthContext";
import { createCookie, removeCookie } from "@/Data/Common/CookieHelper";
import { MockedDependencyProvider } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { useFetchHelpers } from ".";

const setup = () => {
  const wrapper = ({ children }) => (
    <QueryClientProvider client={testClient}>
      <MockedDependencyProvider>{children}</MockedDependencyProvider>
    </QueryClientProvider>
  );

  return wrapper;
};

describe("createHeaders", () => {
  it("should return headers with environment when env is defined", () => {
    const env = "1234abcd";
    const wrapper = setup();

    const { result } = renderHook(() => useFetchHelpers().createHeaders({ env }), {
      wrapper,
    });

    expect(result.current.get("X-Inmanta-Tid")).toEqual(env);
  });

  it("should return headers with message when message is defined", () => {
    const wrapper = setup();

    const { result } = renderHook(
      () => useFetchHelpers().createHeaders({ message: "test-message" }),
      {
        wrapper,
      }
    );

    expect(result.current.get("message")).toEqual("test-message");
  });

  it("should return headers without environment when env is undefined", () => {
    const wrapper = setup();

    const { result } = renderHook(() => useFetchHelpers().createHeaders(), {
      wrapper,
    });

    expect(result.current.get("X-Inmanta-Tid")).toEqual(null);
  });

  it("should return headers without Authorization Token when authController is disabled", () => {
    const wrapper = setup();

    const { result } = renderHook(() => useFetchHelpers().createHeaders(), {
      wrapper,
    });

    expect(result.current.get("Authorization")).toEqual(null);
  });

  it("should return headers without Authorization Token when authHelper hook return undefined", () => {
    const wrapper = setup();

    const { result } = renderHook(() => useFetchHelpers().createHeaders(), {
      wrapper,
    });

    expect(result.current.get("Authorization")).toEqual(null);
  });

  it("should return headers with Authorization Token when authHelper hook returns the token", () => {
    vi.spyOn(defaultAuthContext, "getToken").mockReturnValue("token");
    const wrapper = setup();

    createCookie("inmanta_user", "token", 1);
    const { result } = renderHook(() => useFetchHelpers().createHeaders(), {
      wrapper,
    });

    expect(result.current.get("Authorization")).toEqual("Bearer token");
    removeCookie("inmanta_user");
  });
});
