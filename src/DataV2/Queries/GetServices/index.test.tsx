import React from "react";
import { useLocation } from "react-router-dom";
import {
  QueryClient,
  QueryClientProvider,
  UseQueryResult,
} from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import { RemoteData, ServiceModel } from "@/Core";
import { getStoreInstance } from "@/Data/Store";
import { dependencies } from "@/Test";
import {
  DependencyProvider,
  EnvironmentHandlerImpl,
  PrimaryRouteManager,
} from "@/UI";
import CustomRouter from "@/UI/Routing/CustomRouter";
import history from "@/UI/Routing/history";
import { useGetServices } from ".";

const createWrapper = () => {
  const queryClient = new QueryClient();
  const store = getStoreInstance();

  const environmentHandler = EnvironmentHandlerImpl(
    useLocation,
    PrimaryRouteManager(""),
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
    ]),
  );
  history.push("/?env=aaa");

  return ({ children }) => (
    <StoreProvider store={store}>
      <CustomRouter history={history}>
        <DependencyProvider
          dependencies={{ ...dependencies, environmentHandler }}
        >
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </DependencyProvider>
      </CustomRouter>
    </StoreProvider>
  );
};
const mockedFetch = jest.spyOn(global, "fetch");
mockedFetch.mockImplementation(
  jest.fn(() =>
    Promise.resolve({ json: () => Promise.resolve({ data: null }), ok: true }),
  ) as jest.Mock,
);

beforeEach(() => {
  mockedFetch.mockClear();
});

test("my first test", async () => {
  const Wrapper = createWrapper();
  const states: UseQueryResult<ServiceModel[]>[] = [];

  function Page({
    callback,
  }: {
    callback: (state: UseQueryResult<ServiceModel[], Error>) => void;
  }) {
    const state = useGetServices().useContinuous();

    callback(state);

    return <h1>Status: {state.status}</h1>;
  }
  render(
    <Wrapper>
      <Page callback={(state) => states.push(state)} />
    </Wrapper>,
  );
  expect(mockedFetch).toHaveBeenCalledTimes(1);
  await screen.findByText("Status: success");
  expect(states[0]).toEqual({
    data: undefined,
    dataUpdatedAt: 0,
    error: null,
    errorUpdateCount: 0,
    errorUpdatedAt: 0,
    failureCount: 0,
    failureReason: null,
    fetchStatus: "fetching",
    isError: false,
    isFetched: false,
    isFetchedAfterMount: false,
    isFetching: true,
    isInitialLoading: true,
    isLoading: true,
    isLoadingError: false,
    isPaused: false,
    isPending: true,
    isPlaceholderData: false,
    isRefetchError: false,
    isRefetching: false,
    isStale: true,
    isSuccess: false,
    refetch: expect.any(Function),
    status: "pending",
  });
  expect(states[1]).toEqual({
    data: null,
    dataUpdatedAt: expect.any(Number),
    error: null,
    errorUpdateCount: 0,
    errorUpdatedAt: 0,
    failureCount: 0,
    failureReason: null,
    fetchStatus: "idle",
    isError: false,
    isFetched: true,
    isFetchedAfterMount: true,
    isFetching: false,
    isInitialLoading: false,
    isLoading: false,
    isLoadingError: false,
    isPaused: false,
    isPending: false,
    isPlaceholderData: false,
    isRefetchError: false,
    isRefetching: false,
    isStale: true,
    isSuccess: true,
    refetch: expect.any(Function),
    status: "success",
  });
});
