import React from "react";
import { MemoryRouter, Route, Routes, useSearchParams } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { EnvironmentPreview } from "@/Data/Queries";
import { MockEnvironmentHandler } from "@/Test/Mock";
import { DependencyProvider } from "@/UI/Dependency";
import { PrimaryRouteManager } from "@/UI/Routing";
import { DefaultRoute } from "./DefaultRoute";

const DashboardSentinel: React.FC = () => {
  const [params] = useSearchParams();

  return (
    <>
      <div>Dashboard Page</div>
      {params.get("env") && <span data-testid="selected-env">{params.get("env")}</span>}
    </>
  );
};
const CreateEnvSentinel: React.FC = () => <div>Create Environment Page</div>;

const makeEnvPreview = (id: string): EnvironmentPreview => ({
  id,
  name: `env-${id}`,
  halted: false,
  isExpertMode: false,
  isCompiling: false,
});

interface SetupProps {
  initialPath?: string;
  allEnvironments?: EnvironmentPreview[];
  selectedEnvironment?: EnvironmentPreview;
}

const setup = ({
  initialPath = "/",
  allEnvironments = [],
  selectedEnvironment,
}: SetupProps = {}) => {
  const queryClient = new QueryClient();
  const baseUrl = "";
  const routeManager = PrimaryRouteManager(baseUrl);

  const environmentHandler = {
    ...MockEnvironmentHandler({
      id: selectedEnvironment?.id ?? "",
      name: selectedEnvironment?.name ?? "",
      project_id: "",
      repo_branch: "",
      repo_url: "",
      halted: false,
      settings: {} as never,
      projectName: "",
    }),
    useSelected: () => selectedEnvironment,
    useAll: () => allEnvironments,
  };

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>
        <DependencyProvider dependencies={{ routeManager, environmentHandler }}>
          <Routes>
            <Route path="/" element={<DefaultRoute />} />
            <Route path="/dashboard" element={<DashboardSentinel />} />
            <Route path="/environment/create" element={<CreateEnvSentinel />} />
          </Routes>
        </DependencyProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe("DefaultRoute", () => {
  afterEach(() => {
    localStorage.clear();
  });

  test("GIVEN no environments exist THEN redirects to Create Environment", () => {
    setup({ allEnvironments: [] });

    expect(screen.getByText("Create Environment Page")).toBeVisible();
  });

  test("GIVEN environments exist but none selected THEN redirects to Dashboard with first env", () => {
    const envs = [makeEnvPreview("env-1"), makeEnvPreview("env-2")];

    setup({ allEnvironments: envs });

    expect(screen.getByText("Dashboard Page")).toBeVisible();
  });

  test("GIVEN an environment is already selected THEN redirects to Dashboard", () => {
    const envs = [makeEnvPreview("env-1")];
    const selected = envs[0];

    setup({ allEnvironments: envs, selectedEnvironment: selected });

    expect(screen.getByText("Dashboard Page")).toBeVisible();
  });

  test("GIVEN a valid environment id in localStorage THEN redirects to Dashboard with that environment", () => {
    const envs = [makeEnvPreview("env-1"), makeEnvPreview("env-2")];

    localStorage.setItem("lastSelectedEnvironment", "env-2");
    setup({ allEnvironments: envs });

    expect(screen.getByText("Dashboard Page")).toBeVisible();
    expect(screen.getByTestId("selected-env").textContent).toBe("env-2");
  });

  test("GIVEN an unknown environment id in localStorage THEN redirects to Dashboard with the first environment", () => {
    const envs = [makeEnvPreview("env-1"), makeEnvPreview("env-2")];

    localStorage.setItem("lastSelectedEnvironment", "env-999");
    setup({ allEnvironments: envs });

    expect(screen.getByText("Dashboard Page")).toBeVisible();
    expect(screen.getByTestId("selected-env").textContent).toBe("env-1");
  });
});
