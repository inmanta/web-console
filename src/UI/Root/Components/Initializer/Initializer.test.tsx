import React from "react";
import { act } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { graphql } from "msw/graphql";
import { setupServer } from "msw/node";
import { AuthContextInterface, defaultAuthContext } from "@/Data/Auth/AuthContext";
import {
  EnvironmentPreviewResponse,
  GetEnvironmentPreviewKey,
} from "@/Data/Queries/Slices/Environment";
import { getServerStatusKey } from "@/Data/Queries/Slices/Server";
import { MockedDependencyProvider, ServerStatus } from "@/Test";
import { words } from "@/UI/words";
import { Initializer } from "./Initializer";

const queryBase = graphql.link("/api/v2/graphql");

const accessPolicyMessage = "Request is not allowed by the access policy.";
const proxyErrorPage = "<html><body><h1>502 Bad Gateway</h1></body></html>";

function createQueryClient(): QueryClient {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

const environmentPreviewSuccess = () =>
  HttpResponse.json<{ data: EnvironmentPreviewResponse }>({
    data: {
      data: {
        environments: {
          edges: [
            {
              node: {
                id: "1",
                name: "env-1",
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

function setup(queryClient: QueryClient, authHelper: AuthContextInterface = defaultAuthContext) {
  return (
    <QueryClientProvider client={queryClient}>
      <MockedDependencyProvider authHelper={authHelper}>
        <Initializer>
          <div>shell-content</div>
        </Initializer>
      </MockedDependencyProvider>
    </QueryClientProvider>
  );
}

describe("Initializer", () => {
  const server = setupServer();

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test("GIVEN both queries succeed THEN the children are rendered", async () => {
    server.use(
      http.get("/api/v1/serverstatus", () => HttpResponse.json({ data: ServerStatus.withLsm })),
      queryBase.operation(environmentPreviewSuccess)
    );

    render(setup(createQueryClient()));

    expect(await screen.findByText("shell-content")).toBeVisible();
  });

  test("GIVEN serverStatus succeeds THEN the page title is set to the product name", async () => {
    server.use(
      http.get("/api/v1/serverstatus", () => HttpResponse.json({ data: ServerStatus.withLsm })),
      queryBase.operation(environmentPreviewSuccess)
    );

    render(setup(createQueryClient()));

    await waitFor(() => expect(document.title).toBe(ServerStatus.withLsm.product));
  });

  test("GIVEN serverStatus fails on first load THEN the shell is replaced by an error view", async () => {
    server.use(
      http.get("/api/v1/serverstatus", () => HttpResponse.error()),
      queryBase.operation(environmentPreviewSuccess)
    );

    render(setup(createQueryClient()));

    expect(await screen.findByRole("region", { name: "Initializer-Error" })).toBeVisible();
    expect(screen.queryByText("shell-content")).not.toBeInTheDocument();
  });

  test("GIVEN EnvironmentPreview fails on first load THEN the shell is replaced by an error view", async () => {
    server.use(
      http.get("/api/v1/serverstatus", () => HttpResponse.json({ data: ServerStatus.withLsm })),
      queryBase.operation(() => HttpResponse.error())
    );

    render(setup(createQueryClient()));

    expect(await screen.findByRole("region", { name: "Initializer-Error" })).toBeVisible();
    expect(screen.queryByText("shell-content")).not.toBeInTheDocument();
  });

  test("GIVEN EnvironmentPreview is denied by the access policy THEN the error names the endpoint and offers Retry and Logout", async () => {
    const logout = vi.fn();

    server.use(
      http.get("/api/v1/serverstatus", () => HttpResponse.json({ data: ServerStatus.withLsm })),
      http.post("/api/v2/graphql", () =>
        HttpResponse.json({ message: accessPolicyMessage }, { status: 403 })
      )
    );

    render(setup(createQueryClient(), { ...defaultAuthContext, isDisabled: () => false, logout }));

    expect(
      await screen.findByText(
        words("error.response.endpoint")(accessPolicyMessage, "POST", "/api/v2/graphql")
      )
    ).toBeVisible();
    expect(screen.getByRole("button", { name: words("retry") })).toBeVisible();

    await userEvent.click(screen.getByRole("button", { name: words("dashboard.logout") }));

    expect(logout).toHaveBeenCalled();
  });

  test("GIVEN serverStatus is denied by the access policy THEN the error names the endpoint and offers Retry and Logout", async () => {
    server.use(
      http.get("/api/v1/serverstatus", () =>
        HttpResponse.json({ message: accessPolicyMessage }, { status: 403 })
      ),
      queryBase.operation(environmentPreviewSuccess)
    );

    render(setup(createQueryClient(), { ...defaultAuthContext, isDisabled: () => false }));

    expect(
      await screen.findByText(
        words("error.response.endpoint")(accessPolicyMessage, "GET", "/api/v1/serverstatus")
      )
    ).toBeVisible();
    expect(screen.getByRole("button", { name: words("retry") })).toBeVisible();
    expect(screen.getByRole("button", { name: words("dashboard.logout") })).toBeVisible();
  });

  test("GIVEN serverStatus returns a proxy's HTML error page THEN the error shows a status message instead of the HTML, with Retry and without Logout as auth is disabled", async () => {
    server.use(
      http.get("/api/v1/serverstatus", () => HttpResponse.html(proxyErrorPage, { status: 502 })),
      queryBase.operation(environmentPreviewSuccess)
    );

    render(setup(createQueryClient()));

    expect(await screen.findByText(words("error.response.unreachable")(502))).toBeVisible();
    expect(screen.queryByText(/Bad Gateway/)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: words("retry") })).toBeVisible();
    expect(
      screen.queryByRole("button", { name: words("dashboard.logout") })
    ).not.toBeInTheDocument();
  });

  test("GIVEN EnvironmentPreview succeeded once THEN a later background poll failure keeps the shell rendered and signals the header status", async () => {
    const queryClient = createQueryClient();

    let callCount = 0;

    server.use(
      http.get("/api/v1/serverstatus", () => HttpResponse.json({ data: ServerStatus.withLsm })),
      queryBase.operation(() => {
        callCount += 1;

        return callCount === 1 ? environmentPreviewSuccess() : HttpResponse.error();
      })
    );

    const onStatusDown = vi.fn();

    document.addEventListener("status-down", onStatusDown);

    render(setup(queryClient));

    expect(await screen.findByText("shell-content")).toBeVisible();

    await act(async () => {
      await queryClient.refetchQueries({ queryKey: GetEnvironmentPreviewKey.list([]) });
    });

    await waitFor(() => expect(onStatusDown).toHaveBeenCalled());

    expect(screen.getByText("shell-content")).toBeVisible();
    expect(screen.queryByRole("region", { name: "Initializer-Error" })).not.toBeInTheDocument();

    document.removeEventListener("status-down", onStatusDown);
  });

  test("GIVEN serverStatus succeeded once THEN a later refetch failure (e.g. on window focus) keeps the shell rendered and signals the header status", async () => {
    const queryClient = createQueryClient();

    let callCount = 0;

    server.use(
      http.get("/api/v1/serverstatus", () => {
        callCount += 1;

        return callCount === 1
          ? HttpResponse.json({ data: ServerStatus.withLsm })
          : HttpResponse.error();
      }),
      queryBase.operation(environmentPreviewSuccess)
    );

    const onStatusDown = vi.fn();

    document.addEventListener("status-down", onStatusDown);

    render(setup(queryClient));

    expect(await screen.findByText("shell-content")).toBeVisible();

    await act(async () => {
      await queryClient.refetchQueries({ queryKey: getServerStatusKey.root() });
    });

    await waitFor(() => expect(onStatusDown).toHaveBeenCalled());

    expect(screen.getByText("shell-content")).toBeVisible();
    expect(screen.queryByRole("region", { name: "Initializer-Error" })).not.toBeInTheDocument();

    document.removeEventListener("status-down", onStatusDown);
  });
});
