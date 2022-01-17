import React, { useContext } from "react";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { Either, RemoteData } from "@/Core";
import { QueryResolverImpl } from "@/Data";
import {
  EnvironmentDetailsQueryManager,
  EnvironmentDetailsStateHelper,
} from "@/Data/Managers/EnvironmentDetails";
import { getStoreInstance } from "@/Data/Store";
import {
  DeferredApiHelper,
  dependencies,
  DynamicQueryManagerResolver,
  EnvironmentDetails,
  StaticScheduler,
} from "@/Test";
import {
  DependencyContext,
  DependencyProvider,
  EnvironmentHandlerImpl,
} from "@/UI/Dependency";
import { PrimaryRouteManager } from "@/UI/Routing";

test("GIVEN ContinuousQueryManagerWithEnv WHEN environment changes THEN the api call uses the correct url", async () => {
  const apiHelper = new DeferredApiHelper();
  const store = getStoreInstance();
  store.dispatch.environments.setEnvironments(
    RemoteData.success([
      {
        id: "aaa",
        name: "env-a",
        project_id: "ppp",
        repo_branch: "branch",
        repo_url: "repo",
        projectName: "project",
      },
      {
        id: "bbb",
        name: "env-b",
        project_id: "ppp",
        repo_branch: "branch",
        repo_url: "repo",
        projectName: "project",
      },
    ])
  );
  const stateHelper = new EnvironmentDetailsStateHelper(store);
  const scheduler = new StaticScheduler();
  const queryManager = new EnvironmentDetailsQueryManager(
    apiHelper,
    stateHelper,
    scheduler
  );

  const queryManagerResolver = new DynamicQueryManagerResolver([queryManager]);
  const queryResolver = new QueryResolverImpl(queryManagerResolver);

  const Wrapper: React.FC = ({ children }) => {
    const navigate = useNavigate();
    const environmentHandler = new EnvironmentHandlerImpl(
      useLocation,
      navigate,
      new PrimaryRouteManager("")
    );
    return (
      <DependencyProvider
        dependencies={{ ...dependencies, queryResolver, environmentHandler }}
      >
        {children}
      </DependencyProvider>
    );
  };

  const component = (
    <MemoryRouter initialEntries={[{ search: "?env=aaa" }]}>
      <StoreProvider store={store}>
        <Wrapper>
          <Component />
        </Wrapper>
      </StoreProvider>
    </MemoryRouter>
  );

  render(component);

  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "GET",
    environment: "aaa",
    url: "/api/v2/environment/aaa?details=false",
  });

  await act(async () => {
    await apiHelper.resolve(
      Either.right({
        data: { ...EnvironmentDetails.a, halted: true, id: "aaa" },
      })
    );
  });

  const button = screen.getByRole("button", { name: "change-env" });
  userEvent.click(button);

  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "GET",
    environment: "bbb",
    url: "/api/v2/environment/bbb?details=false",
  });
});

const Component: React.FC = () => {
  const navigate = useNavigate();

  const { queryResolver } = useContext(DependencyContext);

  queryResolver.useContinuous<"GetEnvironmentDetails">({
    kind: "GetEnvironmentDetails",
    details: false,
  });

  return (
    <div>
      <button
        aria-label="change-env"
        onClick={() => navigate(`${location}?env=bbb`)}
      >
        change-env
      </button>
    </div>
  );
};
