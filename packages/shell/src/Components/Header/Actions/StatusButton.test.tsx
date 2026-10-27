import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { shellFeature } from "@inmanta/web-console-shell/shellFeature";
import { MockedDependencyProvider } from "@inmanta/web-console-test-utils";
import { TestMemoryRouter } from "@inmanta/web-console-test-utils/Utils/TestMemoryRouter";
import { testClient } from "@inmanta/web-console-test-utils/Utils/react-query-setup";
import { StatusButton } from "./StatusButton";

function setup() {
  return (
    <QueryClientProvider client={testClient}>
      <TestMemoryRouter initialEntries={["/?env=123"]}>
        <MockedDependencyProvider features={[shellFeature]}>
          <StatusButton />
        </MockedDependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );
}

describe("StatusButton", () => {
  const server = setupServer();

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test("GIVEN StatusButton WHEN health endpoint returns 200 THEN icon is not red", async () => {
    server.use(
      http.get("/api/v2/health", () => {
        return HttpResponse.json({}, { status: 200 });
      })
    );

    render(setup());

    const icon = await screen.findByLabelText("ServerStatus action");

    await waitFor(() => {
      expect(icon.querySelector("svg")).not.toHaveStyle("color: red");
    });
  });

  test("GIVEN StatusButton WHEN health endpoint returns 500 THEN icon turns red without crashing", async () => {
    server.use(
      http.get("/api/v2/health", () => {
        return HttpResponse.json({ message: "unhealthy" }, { status: 500 });
      })
    );

    render(setup());

    const icon = await screen.findByLabelText("ServerStatus action");

    await waitFor(() => {
      expect(icon.querySelector("svg")).toHaveStyle("color: red");
    });
  });

  test("GIVEN StatusButton WHEN a status-down event is dispatched THEN icon turns red", async () => {
    server.use(
      http.get("/api/v2/health", () => {
        return HttpResponse.json({}, { status: 200 });
      })
    );

    render(setup());

    const icon = await screen.findByLabelText("ServerStatus action");

    await waitFor(() => {
      expect(icon.querySelector("svg")).not.toHaveStyle("color: red");
    });

    document.dispatchEvent(new CustomEvent("status-down"));

    await waitFor(() => {
      expect(icon.querySelector("svg")).toHaveStyle("color: red");
    });
  });
});
