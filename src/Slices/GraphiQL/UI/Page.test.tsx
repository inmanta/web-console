import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { MockedDependencyProvider } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { words } from "@/UI";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { Page } from "./Page";

// Stub out the heavy GraphiQL editor — we only test the page shell here.
vi.mock("graphiql", () => ({
  GraphiQL: () => <div data-testid="graphiql-editor" />,
}));

function setup(search = "") {
  const component = (
    <QueryClientProvider client={testClient}>
      <TestMemoryRouter initialEntries={[`/graphiql${search}`]}>
        <MockedDependencyProvider>
          <Page />
        </MockedDependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );

  return { component };
}

describe("GraphiQL Page", () => {
  const server = setupServer();

  beforeAll(() => server.listen());
  beforeEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test("renders the page heading", async () => {
    server.use(
      http.get("/api/v2/graphql/schema", () => HttpResponse.json({ data: {} }, { status: 200 }))
    );

    const { component } = setup();
    render(component);

    expect(
      await screen.findByRole("heading", { name: words("graphiql.title") })
    ).toBeInTheDocument();
  });

  test("renders the GraphiQL editor", async () => {
    server.use(
      http.get("/api/v2/graphql/schema", () => HttpResponse.json({ data: {} }, { status: 200 }))
    );

    const { component } = setup();
    render(component);

    expect(await screen.findByTestId("graphiql-editor")).toBeInTheDocument();
  });

  test("renders correctly with an env query param", async () => {
    server.use(
      http.get("/api/v2/graphql/schema", () => HttpResponse.json({ data: {} }, { status: 200 }))
    );

    const { component } = setup("?env=test-env-id");
    render(component);

    expect(
      await screen.findByRole("heading", { name: words("graphiql.title") })
    ).toBeInTheDocument();
    expect(await screen.findByTestId("graphiql-editor")).toBeInTheDocument();
  });

  test("still renders the editor when the schema fetch fails", async () => {
    server.use(
      http.get("/api/v2/graphql/schema", () =>
        HttpResponse.json({ message: "internal error" }, { status: 500 })
      )
    );

    const { component } = setup();
    render(component);

    expect(
      await screen.findByRole("heading", { name: words("graphiql.title") })
    ).toBeInTheDocument();
    expect(await screen.findByTestId("graphiql-editor")).toBeInTheDocument();
  });
});
