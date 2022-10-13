import React, { useContext } from "react";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { Either, RemoteData } from "@/Core";
import { QueryManagerResolver, QueryResolverImpl } from "@/Data";

import { getStoreInstance } from "@/Data/Store";
import { DeferredApiHelper, dependencies, StaticScheduler } from "@/Test";
import {
  DependencyContext,
  DependencyProvider,
  EnvironmentHandlerImpl,
} from "@/UI/Dependency";
import { PrimaryRouteManager } from "@/UI/Routing";

test("GIVEN QueryManager.ContinuousWithEnv WHEN environment changes THEN the api call uses the correct url", async () => {
  const apiHelper = new DeferredApiHelper();
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const queryResolver = new QueryResolverImpl(
    new QueryManagerResolver(store, apiHelper, scheduler, scheduler)
  );
  store.dispatch.environment.setEnvironments(
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

  const Wrapper: React.FC = ({ children }) => {
    const environmentHandler = EnvironmentHandlerImpl(
      useLocation,
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
    url: "/api/v2/compilereport/123",
    environment: "aaa",
  });

  await act(async () => {
    await apiHelper.resolve(Either.right({ data: null }));
  });

  const button = screen.getByRole("button", { name: "change-env" });
  await userEvent.click(button);

  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "GET",
    url: "/api/v2/compilereport/123",
    environment: "bbb",
  });
});

const Component: React.FC = () => {
  const navigate = useNavigate();

  const { queryResolver } = useContext(DependencyContext);

  queryResolver.useContinuous<"GetCompileDetails">({
    kind: "GetCompileDetails",
    id: "123",
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
