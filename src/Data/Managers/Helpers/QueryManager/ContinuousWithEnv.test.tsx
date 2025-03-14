import React, { useContext, act } from "react";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { Either, RemoteData } from "@/Core";
import { QueryManagerResolverImpl, QueryResolverImpl } from "@/Data";
import { getStoreInstance } from "@/Data/Store";
import { drawerQuery } from "@/Slices/Notification/Core/Query";
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
    new QueryManagerResolverImpl(store, apiHelper, scheduler, scheduler),
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
        halted: false,
        settings: {
          enable_lsm_expert_mode: false,
        },
      },
      {
        id: "bbb",
        name: "env-b",
        project_id: "ppp",
        repo_branch: "branch",
        repo_url: "repo",
        projectName: "project",
        halted: false,
        settings: {
          enable_lsm_expert_mode: false,
        },
      },
    ]),
  );

  const Wrapper: React.FC<React.PropsWithChildren<unknown>> = ({
    children,
  }) => {
    const environmentHandler = EnvironmentHandlerImpl(
      useLocation,
      PrimaryRouteManager(""),
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
    url: "/api/v2/notification?limit=100&filter.cleared=false",
    environment: "aaa",
  });

  await act(async () => {
    await apiHelper.resolve(Either.right({ data: null }));
  });

  const button = screen.getByRole("button", { name: "change-env" });

  await userEvent.click(button);

  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "GET",
    url: "/api/v2/notification?limit=100&filter.cleared=false",
    environment: "bbb",
  });
});

const Component: React.FC = () => {
  const navigate = useNavigate();

  const { queryResolver } = useContext(DependencyContext);

  queryResolver.useContinuous<"GetNotifications">(drawerQuery);

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
