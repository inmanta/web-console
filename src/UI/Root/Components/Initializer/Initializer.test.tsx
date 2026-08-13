import React from "react";
import { act } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { HttpResponse, graphql, http } from "msw";
import { setupServer } from "msw/node";
import {
  EnvironmentPreviewResponse,
  GetEnvironmentPreviewKey,
  getServerStatusKey,
} from "@/Data/Queries";
import { MockedDependencyProvider, ServerStatus } from "@/Test";
import { Initializer } from "./Initializer";

const queryBase = graphql.link("/api/v2/graphql");

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

function setup(queryClient: QueryClient) {
  return (
    <QueryClientProvider client={queryClient}>
      <MockedDependencyProvider>
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
