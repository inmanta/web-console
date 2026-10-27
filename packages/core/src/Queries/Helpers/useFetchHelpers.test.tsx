import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import { words } from "@inmanta/web-console-core";
import { defaultAuthContext } from "@inmanta/web-console-core/Auth/AuthContext";
import { createCookie, removeCookie } from "@inmanta/web-console-core/Common/CookieHelper";
import { MockedDependencyProvider } from "@inmanta/web-console-test-utils";
import { testClient } from "@inmanta/web-console-test-utils/Utils/react-query-setup";
import { ApiEndpoint, getRequiredResponseBody, parseJsonResponse, useFetchHelpers } from ".";

const accessPolicyMessage = "Request is not allowed by the access policy.";
const proxyErrorPage = "<html><body><h1>502 Bad Gateway</h1></body></html>";
const graphqlEndpoint: ApiEndpoint = { method: "POST", path: "/api/v2/graphql" };

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

describe("handleErrors", () => {
  const renderHandleErrors = () =>
    renderHook(() => useFetchHelpers().handleErrors, { wrapper: setup() }).result.current;

  it("GIVEN a failed response with a JSON message THEN the error has that message and status", async () => {
    const handleErrors = renderHandleErrors();
    const response = new Response(JSON.stringify({ message: "Environment not found" }), {
      status: 404,
    });

    await expect(
      handleErrors(response, { method: "GET", path: "/api/v2/environment/abc" })
    ).rejects.toMatchObject({ message: "Environment not found", status: 404 });
  });

  it("GIVEN a failed GraphQL response THEN the error has the first GraphQL error as message", async () => {
    const handleErrors = renderHandleErrors();
    const graphqlError = "Cannot query field 'noSuchField' on type 'Environment'.";
    const response = new Response(
      JSON.stringify({ data: { data: null, errors: [graphqlError], extensions: {} } }),
      { status: 400 }
    );

    await expect(handleErrors(response, graphqlEndpoint)).rejects.toMatchObject({
      message: graphqlError,
      status: 400,
    });
  });

  it("GIVEN a 403 THEN the message names the endpoint without its query string", async () => {
    const handleErrors = renderHandleErrors();
    const response = new Response(JSON.stringify({ message: accessPolicyMessage }), {
      status: 403,
    });

    await expect(
      handleErrors(response, { method: "GET", path: "/api/v2/resource?limit=20" })
    ).rejects.toMatchObject({
      message: words("error.response.endpoint")(accessPolicyMessage, "GET", "/api/v2/resource"),
      status: 403,
    });
  });

  it("GIVEN a 403 without a JSON message THEN the message is based on the status and names the endpoint", async () => {
    const handleErrors = renderHandleErrors();
    const response = new Response("<html><body><h1>403 Forbidden</h1></body></html>", {
      status: 403,
      headers: { "Content-Type": "text/html" },
    });

    await expect(handleErrors(response, graphqlEndpoint)).rejects.toMatchObject({
      message: words("error.response.endpoint")(
        words("error.response.unexpected")(403),
        graphqlEndpoint.method,
        graphqlEndpoint.path
      ),
      status: 403,
    });
  });

  it("GIVEN a proxy's HTML error page THEN the message is based on the status instead of the HTML", async () => {
    const handleErrors = renderHandleErrors();
    const response = new Response(proxyErrorPage, {
      status: 502,
      headers: { "Content-Type": "text/html" },
    });

    await expect(handleErrors(response, graphqlEndpoint)).rejects.toMatchObject({
      message: words("error.response.unreachable")(502),
      status: 502,
    });
  });

  it("GIVEN a failed response with an empty JSON message THEN the message is based on the status", async () => {
    const handleErrors = renderHandleErrors();
    const response = new Response(JSON.stringify({ message: "" }), { status: 500 });

    await expect(handleErrors(response, graphqlEndpoint)).rejects.toMatchObject({
      message: words("error.response.unexpected")(500),
      status: 500,
    });
  });

  it("GIVEN a failed response with a plain text body THEN the message says the response was unexpected", async () => {
    const handleErrors = renderHandleErrors();
    const response = new Response("Internal Server Error", { status: 500 });

    await expect(handleErrors(response, graphqlEndpoint)).rejects.toMatchObject({
      message: words("error.response.unexpected")(500),
      status: 500,
    });
  });

  it("GIVEN a 401 THEN the login flow starts", async () => {
    const login = vi.spyOn(defaultAuthContext, "login");
    const handleErrors = renderHandleErrors();
    const response = new Response(JSON.stringify({ message: "Access token is expired" }), {
      status: 401,
    });

    await expect(handleErrors(response, graphqlEndpoint)).rejects.toThrow();
    expect(login).toHaveBeenCalled();
  });

  it("GIVEN a successful response THEN nothing is thrown", async () => {
    const handleErrors = renderHandleErrors();

    await expect(handleErrors(new Response("{}"), graphqlEndpoint)).resolves.toBeUndefined();
  });
});

describe("parseJsonResponse", () => {
  it("GIVEN a JSON body THEN it returns the parsed body", async () => {
    await expect(parseJsonResponse(new Response('{"data":[]}'))).resolves.toEqual({ data: [] });
  });

  it("GIVEN an empty body THEN it returns undefined", async () => {
    await expect(parseJsonResponse(new Response(""))).resolves.toBeUndefined();
  });

  it("GIVEN a proxy's HTML page with status 200 THEN it throws an unexpected response error", async () => {
    await expect(parseJsonResponse(new Response("<html></html>"))).rejects.toMatchObject({
      message: words("error.response.unexpected")(200),
      status: 200,
    });
  });

  it("GIVEN a redirected response with an HTML page THEN it throws a session expired error", async () => {
    const response = new Response("<html></html>");

    Object.defineProperty(response, "redirected", { value: true });

    await expect(parseJsonResponse(response)).rejects.toMatchObject({
      message: words("error.response.redirected"),
      status: 200,
    });
  });
});

describe("getRequiredResponseBody", () => {
  it("GIVEN a parsed response body THEN it returns that body", () => {
    expect(getRequiredResponseBody({ data: [] })).toEqual({ data: [] });
  });

  it("GIVEN no response body THEN it throws an empty response error", () => {
    expect(() => getRequiredResponseBody(undefined)).toThrow(words("error.response.empty"));
  });
});
