import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { MockedDependencyProvider, MockOrchestratorProvider } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { words } from "@/UI/words";
import { mockedMetrics } from "../Core/Mock";
import { Dashboard } from "./Dashboard";

const server = setupServer(
  http.get("/api/v2/metrics", () => {
    return HttpResponse.json({
      data: mockedMetrics,
    });
  })
);

const setup = (isLsmEnabled = false) => {
  vi.spyOn(MockOrchestratorProvider.prototype, "isLsmEnabled").mockReturnValue(isLsmEnabled);

  const component = (
    <QueryClientProvider client={testClient}>
      <TestMemoryRouter>
        <MockedDependencyProvider>
          <Dashboard />
        </MockedDependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );

  return { component };
};

describe("Dashboard", () => {
  beforeAll(() => server.listen());
  afterEach(() => {
    server.resetHandlers();
    vi.clearAllMocks();
  });
  afterAll(() => server.close());

  it("should show loading state initially", () => {
    const { component } = setup();

    render(component);

    expect(screen.getByLabelText("Metrics-Loading")).toBeInTheDocument();
  });

  it("should show error state when API call fails", async () => {
    server.use(
      http.get("/api/v2/metrics", () => {
        return HttpResponse.error();
      })
    );

    const { component } = setup();

    render(component);

    await waitFor(() => {
      expect(screen.getByLabelText("Metrics-Failed")).toBeInTheDocument();
    });
  });

  it("should show metrics data when API call succeeds", async () => {
    const { component } = setup();

    render(component);

    await waitFor(() => {
      expect(screen.getByLabelText("Metrics-Success")).toBeInTheDocument();
    });

    // Verify sections are rendered
    expect(screen.getByText(words("navigation.orchestrationEngine"))).toBeInTheDocument();
    expect(screen.getByText(words("navigation.resourceManager"))).toBeInTheDocument();
  });

  it("should show LSM section when LSM is enabled", async () => {
    const { component } = setup(true);

    render(component);

    await waitFor(() => {
      expect(screen.getByLabelText("Metrics-Success")).toBeInTheDocument();
    });

    expect(screen.getByText(words("navigation.lifecycleServiceManager"))).toBeInTheDocument();
  });

  it("should not show LSM section when LSM is disabled", async () => {
    const { component } = setup(false);

    render(component);

    await waitFor(() => {
      expect(screen.getByLabelText("Metrics-Success")).toBeInTheDocument();
    });

    expect(screen.queryByText(words("navigation.lifecycleServiceManager"))).not.toBeInTheDocument();
  });

  it("should update date range when refresh button is clicked", async () => {
    let counter = 0;

    server.use(
      http.get("/api/v2/metrics", () => {
        counter++;

        return HttpResponse.json({
          data: mockedMetrics,
        });
      })
    );

    const { component } = setup(true);

    render(component);
    expect(counter).toBe(0);
    await waitFor(() => {
      expect(screen.getByLabelText("Metrics-Success")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(counter).toBe(1);
    });
    const refreshButton = screen.getByText(words("dashboard.refresh"));

    await userEvent.click(refreshButton);

    // The component should still be in success state after refresh
    expect(screen.getByLabelText("Metrics-Success")).toBeInTheDocument();
    await waitFor(() => {
      expect(counter).toBe(2);
    });
  });
});
